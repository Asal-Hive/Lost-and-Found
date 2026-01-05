from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import OTPCode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer as BaseTokenObtainPairSerializer
from django.utils import timezone
from datetime import timedelta
from .utils import default_expiry_minutes

User = get_user_model()


class TokenObtainPairSerializer(BaseTokenObtainPairSerializer):
    """Custom token serializer that accepts email as username."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].required = False
        self.fields['email'] = serializers.EmailField(required=False, write_only=True)
    
    def validate(self, attrs):
        if 'email' in attrs and 'username' not in attrs:
            attrs['username'] = attrs['email']
        
        if 'username' not in attrs or not attrs['username']:
            raise serializers.ValidationError({
                'username': 'ایمیل یا نام کاربری الزامی است.'
            })
        
        return super().validate(attrs)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                'این ایمیل قبلاً ثبت شده است.'
            )
        return value

    def validate_password(self, value):
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data.get('password')
        # If a password is provided at registration, activate the account immediately
        # so the user can log in right away. Otherwise keep account inactive until
        # email verification via OTP.
        is_active = True if password else False
        user = User.objects.create_user(username=email, email=email, is_active=is_active)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate_password(self, value):
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        email = attrs.get('email')
        code = attrs.get('code')
        
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('ایمیل یا کد نامعتبر است.')
        
        otp = OTPCode.objects.filter(
            user=user, 
            code=code, 
            purpose='activation', 
            is_used=False
        ).order_by('-created_at').first()
        
        if not otp:
            raise serializers.ValidationError('کد نامعتبر است.')
        
        if not otp.is_valid():
            raise serializers.ValidationError('کد منقضی شده یا استفاده شده است.')
        
        # Store for use in view
        attrs['_user'] = user
        attrs['_otp'] = otp
        return attrs


class PasswordConfirmationMixin:
    def validate(self, attrs):
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        if password != password_confirm:
            raise serializers.ValidationError({
                'password_confirm': 'رمزهای وارد شده یکسان نیستند.'
            })
        
        return attrs


class SetPasswordSerializer(PasswordConfirmationMixin, serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        
        email = attrs.get('email')
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'email': 'کاربر یافت نشد.'})
        
        # Ensure user recently verified an activation OTP
        window_start = timezone.now() - timedelta(minutes=default_expiry_minutes())
        recent_used = OTPCode.objects.filter(
            user=user, 
            purpose='activation', 
            is_used=True, 
            created_at__gte=window_start
        )
        
        if not recent_used.exists():
            raise serializers.ValidationError(
                'برای تنظیم رمز باید ابتدا ایمیل را تأیید کنید.'
            )
        
        attrs['_user'] = user
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get('email')
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'email': 'این ایمیل در سیستم وجود ندارد.'})
        
        attrs['_user'] = user
        return attrs


class ResetPasswordSerializer(PasswordConfirmationMixin, serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField()
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    def validate_password(self, value):
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        email = attrs.get('email')
        code = attrs.get('code')
        password = attrs.get('password')
        
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'email': 'کاربر یافت نشد.'})
        
        otp = OTPCode.objects.filter(
            user=user, 
            code=code, 
            purpose='reset', 
            is_used=False
        ).order_by('-created_at').first()
        
        if not otp:
            raise serializers.ValidationError('کد نامعتبر است.')
        
        if not otp.is_valid():
            raise serializers.ValidationError('کد منقضی شده یا استفاده شده است.')
        
        # If password is provided, validate password_confirm
        if password:
            attrs = super().validate(attrs)
        
        attrs['_user'] = user
        attrs['_otp'] = otp
        return attrs

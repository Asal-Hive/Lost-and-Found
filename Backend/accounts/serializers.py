from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            return value
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
            user.save()
        else:
            user.set_unusable_password()
            user.save()
        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)


class SetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        pw = attrs.get('password')
        pw2 = attrs.get('password_confirm')
        if not pw or len(pw) < 8:
            raise serializers.ValidationError({'password': 'رمز عبور باید حداقل ۸ کاراکتر باشد.'})
        if pw != pw2:
            raise serializers.ValidationError({'password_confirm': 'رمزهای وارد شده یکسان نیستند.'})
        return attrs

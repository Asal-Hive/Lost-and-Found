from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import (
    RegisterSerializer, 
    VerifyOTPSerializer,
    SetPasswordSerializer,
    ForgotPasswordSerializer, 
    ResetPasswordSerializer,
    TokenObtainPairSerializer
)
from .models import OTPCode
from .utils import generate_numeric_otp, send_otp_email, default_expiry_minutes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed


class CustomTokenObtainPairView(APIView):
    """Handle user login with email/username and password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = TokenObtainPairSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        except AuthenticationFailed:
            return Response(
                {'detail': 'اطلاعات ورود نامعتبر یا حساب فعال نیست.'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            print(str(e))
            return Response(
                {'detail': 'اطلاعات ورود نامعتبر یا حساب فعال نیست.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class RegisterView(APIView):
    """Handle user registration and send OTP for email verification."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()
        
        # Generate and send OTP
        code = generate_numeric_otp(6)
        
        expires_at = timezone.now() + timedelta(minutes=default_expiry_minutes())
        OTPCode.objects.create(
            user=user, 
            code=code, 
            purpose='activation', 
            expires_at=expires_at
        )
        
        send_otp_email(user.email, code, purpose='activation')
        
        return Response(
            {'detail': 'کاربر ایجاد شد، کد تایید ارسال شد.'}, 
            status=status.HTTP_201_CREATED
        )


class VerifyOTPView(APIView):
    """Verify OTP code for email activation."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['_user']
        otp = serializer.validated_data['_otp']

        otp.is_used = True
        otp.save()
        
        user.is_active = True
        user.save()

        return Response(
            {'detail': 'ایمیل تایید شد.'}, 
            status=status.HTTP_200_OK
        )


class SetPasswordView(APIView):
    """Set password after email verification."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['_user']
        password = serializer.validated_data['password']

        user.set_password(password)
        user.save()

        # Return tokens for immediate login
        refresh = RefreshToken.for_user(user)
        return Response({
            'detail': 'ثبت‌ نام با موفقیت انجام شد.',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """Request password reset OTP."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data['_user']

        code = generate_numeric_otp(6)
        
        expires_at = timezone.now() + timedelta(minutes=default_expiry_minutes())
        OTPCode.objects.create(
            user=user, 
            code=code, 
            purpose='reset', 
            expires_at=expires_at
        )
        
        send_otp_email(user.email, code, purpose='reset')
        
        return Response(
            {'detail': 'کد بازیابی به ایمیل ارسال شد.'}, 
            status=status.HTTP_200_OK
        )


class ResetPasswordView(APIView):
    """Verify reset OTP and set new password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # If only email+code (no password), validate OTP only
        if 'password' not in request.data:
            serializer = ResetPasswordSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({'detail': 'کد معتبر است.'}, status=status.HTTP_200_OK)

        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['_user']
        otp = serializer.validated_data['_otp']
        password = serializer.validated_data['password']

        otp.is_used = True
        otp.save()

        user.set_password(password)
        user.save()

        return Response(
            {'detail': 'رمز عبور با موفقیت تغییر کرد.'}, 
            status=status.HTTP_200_OK
        )

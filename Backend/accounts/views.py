from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, VerifyOTPSerializer
from .models import OTPCode
from .utils import generate_numeric_otp, send_otp_email, default_expiry_minutes
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
import json
import sys


def extract_request_data(request):
    """Return a dict-like payload from various request sources.

    Tries, in order: DRF request.data, parsed JSON body, HttpRequest.POST, request.GET.
    """
    # start with DRF-parsed data
    data = None
    try:
        data = request.data
    except Exception:
        data = None

    # convert immutable QueryDict to a mutable copy if possible
    if hasattr(data, 'copy'):
        try:
            data = data.copy()
        except Exception:
            pass

    # if empty or not a dict-like, try to parse raw body as JSON
    if (not data or (isinstance(data, dict) and not data)) and getattr(request, 'body', None):
        try:
            parsed = json.loads(request.body.decode())
            if isinstance(parsed, dict):
                data = parsed
        except Exception:
            pass

    # fallback to underlying HttpRequest.POST (form data)
    if (not data or (isinstance(data, dict) and not data)) and hasattr(request, '_request'):
        try:
            post = request._request.POST
            if post:
                data = post
        except Exception:
            pass

    # lastly try GET params
    if (not data or (isinstance(data, dict) and not data)) and hasattr(request, 'GET'):
        try:
            get = request.GET
            if get:
                data = get
        except Exception:
            pass

    return data or {}

User = get_user_model()


class CustomTokenObtainPairView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = extract_request_data(request)
        try:
            print('[REGISTER] incoming payload:', data)
            sys.stdout.flush()
        except Exception:
            pass
        # accept email as alias
        if isinstance(data, dict) and 'username' not in data and 'email' in data:
            data['username'] = data.get('email')

        serializer = TokenObtainPairSerializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        except AuthenticationFailed as e:
            return Response({'detail': 'اطلاعات ورود نامعتبر یا حساب فعال نیست.'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            # other validation errors - return a generic Persian message
            return Response({'detail': 'اطلاعات ورود نامعتبر یا حساب فعال نیست.'}, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = extract_request_data(request)
        email = None
        try:
            if isinstance(data, dict):
                email = data.get('email') or data.get('username')
            else:
                # QueryDict or other mapping-like
                email = data.get('email') or data.get('username')
        except Exception:
            email = None

        # legacy fallback
        if not email and hasattr(request, '_request'):
            try:
                email = request._request.POST.get('email') or request._request.POST.get('username')
            except Exception:
                email = None

        if not email:
            return Response({'email': ['فیلد ایمیل الزامی است.']}, status=status.HTTP_400_BAD_REQUEST)

        # if user exists
        try:
            existing = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            existing = None

        if existing:
            # Do not proceed if the email already exists — inform the user instead.
            return Response({'email': ['این ایمیل قبلاً ثبت شده است. لطفاً وارد شوید یا از بازیابی رمز استفاده کنید.']}, status=status.HTTP_400_BAD_REQUEST)

        payload = {'email': email}
        if 'password' in data and data.get('password') is not None:
            payload['password'] = data.get('password')
        serializer = RegisterSerializer(data=payload)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()

        code = generate_numeric_otp(6)
        try:
            print(f"[REGISTER] new user {user.email} OTP: {code}")
            sys.stdout.flush()
        except Exception:
            pass
        expires_at = timezone.now() + timedelta(minutes=default_expiry_minutes())
        OTPCode.objects.create(user=user, code=code, purpose='activation', expires_at=expires_at)
        try:
            print(f"[REGISTER] calling send_otp_email for {user.email}")
            sys.stdout.flush()
        except Exception:
            pass
        send_otp_email(user.email, code, purpose='activation')
        return Response({'detail': 'کاربر ایجاد شد، کد تایید ارسال شد.'}, status=status.HTTP_201_CREATED)


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = extract_request_data(request)
        serializer = VerifyOTPSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': 'ایمیل یا کد نامعتبر است.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_qs = OTPCode.objects.filter(user=user, code=code, purpose='activation', is_used=False).order_by('-created_at')
        if not otp_qs.exists():
            return Response({'detail': 'کد نامعتبر است.'}, status=status.HTTP_400_BAD_REQUEST)
        otp = otp_qs.first()
        if not otp.is_valid():
            return Response({'detail': 'کد منقضی شده یا استفاده شده است.'}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save()
        user.is_active = True
        user.save()

        # Do NOT set password or return tokens here; the frontend will collect password on a separate page.
        return Response({'detail': 'ایمیل تایید شد.'}, status=status.HTTP_200_OK)


class SetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = extract_request_data(request)
        from .serializers import SetPasswordSerializer

        serializer = SetPasswordSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': 'کاربر یافت نشد.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure user recently verified an activation OTP (used) within the expiry window
        window_start = timezone.now() - timedelta(minutes=default_expiry_minutes())
        recent_used = OTPCode.objects.filter(user=user, purpose='activation', is_used=True, created_at__gte=window_start)
        if not recent_used.exists():
            return Response({'detail': 'برای تنظیم رمز باید ابتدا ایمیل را تأیید کنید.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        # return tokens so frontend can log in immediately
        refresh = RefreshToken.for_user(user)
        return Response({
            'detail': 'رمز با موفقیت ثبت شد.',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)

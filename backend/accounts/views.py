from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import get_user_model
from datetime import timedelta
import random

from .models import OTP
from .serializers import VerifyOTPSerializer, SignupSerializer, LoginSerializer

User = get_user_model()

# -------------------------------
# Request OTP
# -------------------------------
class RequestOTPView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        # check if user exists
        if User.objects.filter(email=email).exists():
            return Response({"message": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

        # generate OTP (6 digits)
        otp_code = f"{random.randint(100000, 999999)}"
        OTP.objects.create(
            email=email,
            otp_hash=make_password(otp_code),
            expires_at=timezone.now() + timedelta(minutes=5)
        )
        print(f"OTP CODE: {otp_code}")  # print in terminal for testing
        return Response({"message": "OTP sent"}, status=status.HTTP_200_OK)


# -------------------------------
# Verify OTP
# -------------------------------
class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp']

        otp_obj = OTP.objects.filter(email=email, verified=False).order_by('-created_at').first()
        if not otp_obj:
            return Response({"message": "OTP not found"}, status=status.HTTP_400_BAD_REQUEST)

        if otp_obj.expires_at < timezone.now():
            return Response({"message": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        if otp_obj.attempts >= 5:
            return Response({"message": "Too many attempts"}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        if not check_password(otp_code, otp_obj.otp_hash):
            otp_obj.attempts += 1
            otp_obj.save()
            return Response({"message": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        otp_obj.verified = True
        otp_obj.save()
        return Response({"message": "OTP verified"}, status=status.HTTP_200_OK)


# -------------------------------
# Set Password
# -------------------------------
class SetPasswordView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)  # reuse SignupSerializer for email + password
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        # find OTP verified
        otp_obj = OTP.objects.filter(email=email, verified=True).order_by('-created_at').first()
        if not otp_obj:
            return Response({"message": "OTP not verified"}, status=status.HTTP_400_BAD_REQUEST)

        # create user
        user = User.objects.create_user(email=email, password=password)
        return Response({"message": "Account created successfully"}, status=status.HTTP_201_CREATED)


# -------------------------------
# Login
# -------------------------------
import jwt
from django.conf import settings
from datetime import datetime, timedelta

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # generate JWT token
        payload = {
            "user_id": user.id,
            "exp": datetime.utcnow() + timedelta(days=1),
            "iat": datetime.utcnow()
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        return Response({"token": token, "email": user.email}, status=status.HTTP_200_OK)

from django.urls import path
from .views import RegisterView, VerifyOTPView, SetPasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='api-register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='api-verify-otp'),
    path('set-password/', SetPasswordView.as_view(), name='api-set-password'),
]

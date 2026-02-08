from django.urls import path
from .views import RegisterView, VerifyOTPView, SetPasswordView, ForgotPasswordView, ResetPasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='api-register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='api-verify-otp'),
    path('set-password/', SetPasswordView.as_view(), name='api-set-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='api-forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='api-reset-password'),
]

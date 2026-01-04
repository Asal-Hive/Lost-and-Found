from django.urls import path
from .views import RequestOTPView, VerifyOTPView, SetPasswordView, LoginView

urlpatterns = [
    path('signup/request-otp/', RequestOTPView.as_view(), name='request-otp'),
    path('signup/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('signup/set-password/', SetPasswordView.as_view(), name='set-password'),
    path('login/', LoginView.as_view(), name='login'),
]

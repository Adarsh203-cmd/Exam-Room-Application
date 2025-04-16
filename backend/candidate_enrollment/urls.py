from django.urls import path
from .views import SendOTPView, VerifyOTPAndRegisterView, LoginView

urlpatterns = [
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp-register/', VerifyOTPAndRegisterView.as_view(), name='verify-otp-register'),
    path('login/', LoginView.as_view(), name='login'),
]

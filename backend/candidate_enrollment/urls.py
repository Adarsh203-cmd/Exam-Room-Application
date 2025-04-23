from django.urls import path
from .views import SendOTPView, VerifyOTPAndRegisterView, LoginView, CandidateListView, SendResetOTPView, ResetPasswordView

urlpatterns = [
    path('send-otp/', SendOTPView.as_view(), name='send-otp'), #http://localhost:8000/api/candidate/send-otp
    path('verify-otp-register/', VerifyOTPAndRegisterView.as_view(), name='verify-otp-register'), #http://localhost:8000/api/candidate/verify-otp-register
    path('login/', LoginView.as_view(), name='login'), #http://localhost:8000/api/candidate/login
    path('candidateList/', CandidateListView.as_view(), name='candidate-list'),  #http://localhost:8000/api/candidate/candidateList
    # Send OTP for password reset
    path('reset/send-otp/', SendResetOTPView.as_view(), name='reset-send-otp'),
    # Reset password using OTP
    path('reset/password/', ResetPasswordView.as_view(), name='reset-password'),
]

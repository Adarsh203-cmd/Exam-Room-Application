from django.urls import path, include
from .views import CandidateRegisterView, SendOTPView, VerifyOTPAndRegister, LoginView

urlpatterns = [
    path("register/", CandidateRegisterView.as_view(), name="candidate-register"),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp-register/', VerifyOTPAndRegister.as_view(), name='verify-otp-register'),
    path('login/', LoginView.as_view(), name='login'),
]

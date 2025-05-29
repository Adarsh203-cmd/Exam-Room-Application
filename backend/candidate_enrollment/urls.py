from django.urls import path
from .views import (
    SendOTPView,
    VerifyOTPAndRegisterView,
    LoginView,
    CandidateListView,
    SendResetOTPView,
    ResetPasswordView,
    InternalCandidateListCreateView,
    InternalCandidateDetailView,
    ExternalCandidateListCreateView,
    ExternalCandidateDetailView
)

urlpatterns = [
    # OTP & Registration
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),  # http://localhost:8000/api/candidate/send-otp
    path('verify-otp-register/', VerifyOTPAndRegisterView.as_view(), name='verify-otp-register'),  # http://localhost:8000/api/candidate/verify-otp-register
    path('login/', LoginView.as_view(), name='login'),  # http://localhost:8000/api/candidate/login
    path('candidateList/', CandidateListView.as_view(), name='candidate-list'),  # http://localhost:8000/api/candidate/candidateList

    # Password Reset
    path('reset/send-otp/', SendResetOTPView.as_view(), name='reset-send-otp'),
    path('reset/password/', ResetPasswordView.as_view(), name='reset-password'),

    # Candidate Profile Management
    # Internal Candidates
    path('internal-candidates/', InternalCandidateListCreateView.as_view(), name='internal-candidate-list'),
    path('internal-candidates/<uuid:id>/', InternalCandidateDetailView.as_view(), name='internal-candidate-detail'),

    # External Candidates
    path('external-candidates/', ExternalCandidateListCreateView.as_view(), name='external-candidate-list'),
    path('external-candidates/<uuid:id>/', ExternalCandidateDetailView.as_view(), name='external-candidate-detail'),
]

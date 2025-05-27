# candidate_enrollment/utils.py

from candidate_enrollment.models import InternalCandidate, ExternalCandidate
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken


def authenticate_candidate(user_id, password):
    candidate = InternalCandidate.objects.filter(user_id=user_id).first() or \
                ExternalCandidate.objects.filter(user_id=user_id).first()

    if candidate and check_password(password, candidate.password):
        temp_user, _ = User.objects.get_or_create(username=f"candidate_{user_id}")
        refresh = RefreshToken.for_user(temp_user)

        return {
            "message": "Candidate login successful",
            "role": "internal" if isinstance(candidate, InternalCandidate) else "external",
            "candidate_id": str(candidate.id),
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, candidate

    return None, None

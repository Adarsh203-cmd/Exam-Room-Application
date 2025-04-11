from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import InternalCandidate, ExternalCandidate
from .serializers import InternalCandidateSerializer, ExternalCandidateSerializer
from django.core.mail import send_mail
from django.core.cache import cache
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
import random
import string
from django.conf import settings
from django.db.models import Q

#Candidate Registration
class CandidateRegisterView(APIView):
    def post(self, request):
        data = request.data
        user_type = data.get('user_type')

        if user_type == 'external':
            # Generate user_id and password
            prefix = "EXT"
            count = ExternalCandidate.objects.count() + 1
            user_id = f"{prefix}{1000 + count}"
            raw_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            hashed_password = make_password(raw_password)

            data['user_id'] = user_id
            data['password'] = hashed_password

            serializer = ExternalCandidateSerializer(data=data)

            if serializer.is_valid():
                serializer.save()

                # Send email with raw password
                message = (
                    f"Hello {data['first_name']} {data['last_name']},\n\n"
                    f"Thank you for registering for the Exam Portal at Elogixa.\n\n"
                    f"Here are your login credentials:\n"
                    f"User ID: {user_id}\n"
                    f"Password: {raw_password}\n\n"
                    f"Please keep this information safe and do not share it with anyone.\n\n"
                    f"Best regards,\nElogixa Team"
                )

                send_mail(
                    subject="Exam Portal Registration Details",
                    message=message,
                    from_email="noreply@example.com",
                    recipient_list=[data['email']],
                    fail_silently=False,
                )

                return Response({"message": "External candidate registered successfully."}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif user_type == 'internal':
            # Generate user_id and password
            prefix = "INT"
            count = InternalCandidate.objects.count() + 1
            user_id = f"{prefix}{1000 + count}"
            raw_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            hashed_password = make_password(raw_password)

            data['user_id'] = user_id
            data['password'] = hashed_password

            serializer = InternalCandidateSerializer(data=data)

            if serializer.is_valid():
                serializer.save()

                # Send email with raw password
                message = (
                    f"Hello {data['first_name']} {data['last_name']},\n\n"
                    f"Thank you for registering for the Exam Portal at Elogixa.\n\n"
                    f"Here are your login credentials:\n"
                    f"User ID: {user_id}\n"
                    f"Password: {raw_password}\n\n"
                    f"Please keep this information safe and do not share it with anyone.\n\n"
                    f"Best regards,\nElogixa Team"
                )

                send_mail(
                    subject="Exam Portal Registration Details",
                    message=message,
                    from_email="noreply@example.com",
                    recipient_list=[data['email']],
                    fail_silently=False,
                )

                return Response({"message": "Internal candidate registered successfully."}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Invalid user type"}, status=status.HTTP_400_BAD_REQUEST)


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


class SendOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        otp = generate_otp()
        cache.set(f"otp_{email}", otp, timeout=180)  # 3 minutes = 180 seconds

        # Send OTP email
        send_mail(
            subject="Your OTP for Exam Portal Registration",
            message=f"Your OTP is: {otp}\nThis is valid for 3 minutes.",
            from_email="noreply@example.com",
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({"message": "OTP sent to your email"}, status=status.HTTP_200_OK)


class VerifyOTPAndRegister(APIView):
    def post(self, request):
        data = request.data
        user_type = data.get('user_type')
        email = data.get('email')
        entered_otp = data.get('otp')

        if not email or not entered_otp:
            return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        cached_otp = cache.get(f"otp_{email}")

        if not cached_otp or cached_otp != entered_otp:
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

        # OTP verified, now register user
        prefix = "EXT" if user_type == "external" else "INT"
        count = ExternalCandidate.objects.count() + 1 if user_type == "external" else InternalCandidate.objects.count() + 1
        user_id = f"{prefix}{1000 + count}"
        raw_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        hashed_password = make_password(raw_password)

        data['user_id'] = user_id
        data['password'] = hashed_password

        serializer_class = ExternalCandidateSerializer if user_type == "external" else InternalCandidateSerializer
        serializer = serializer_class(data=data)

        if serializer.is_valid():
            serializer.save()

            # Send final credentials
            send_mail(
                subject="Registration Successful - Exam Portal",
                message=f"Hello {data['first_name']} {data['last_name']},\n\nYour registration is complete.\nUser ID: {user_id}\nPassword: {raw_password}",
                from_email="noreply@example.com",
                recipient_list=[email],
                fail_silently=False,
            )

            cache.delete(f"otp_{email}")  # clean up
            return Response({"message": "Candidate registered successfully."}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Login view
# For admin login
ADMIN_EMAIL = "hrelogixa@gmail.com"

class LoginView(APIView):
    def post(self, request):
        login_type = request.data.get('login_type')  # "admin" or "candidate"
        identifier = request.data.get('identifier')  # email for admin, user_id for candidates
        password = request.data.get('password')

        if login_type == 'admin':
            if identifier != ADMIN_EMAIL:
                return Response({"error": "Invalid admin email"}, status=status.HTTP_400_BAD_REQUEST)

            from django.contrib.auth.models import User
            try:
                admin_user = User.objects.get(email=identifier)
                if check_password(password, admin_user.password):
                    return Response({"message": "Admin login successful", "role": "admin"}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Incorrect password"}, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                return Response({"error": "Admin not found"}, status=status.HTTP_404_NOT_FOUND)


        elif login_type == 'candidate':
            try:
                # Try finding user in both models
                candidate = InternalCandidate.objects.filter(user_id=identifier).first() or \
                            ExternalCandidate.objects.filter(user_id=identifier).first()

                if candidate and check_password(password, candidate.password):
                    return Response({
                        "message": "Candidate login successful",
                        "role": "internal" if isinstance(candidate, InternalCandidate) else "external",
                        "candidate_id": str(candidate.id)
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

            except Exception as e:
                return Response({"error": "Something went wrong"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:
            return Response({"error": "Invalid login type"}, status=status.HTTP_400_BAD_REQUEST)
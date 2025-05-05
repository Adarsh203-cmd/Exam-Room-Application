from django.core.mail import send_mail
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from .models import InternalCandidate, ExternalCandidate
from .serializers import InternalCandidateSerializer, ExternalCandidateSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import random
import string
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .filters import CandidateFilter
from django.core.cache import cache
#from .utils import generate_otp 

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


# View to send OTP
class SendOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        otp = generate_otp()

        # Save OTP in cache with a timeout of 5 minutes
        cache.set(f"otp_{email}", otp, timeout=300)

        # Send OTP to the email
        send_mail(
            subject="Your OTP for Registration",
            message=f"Your OTP is {otp}. It is valid for 5 minutes.",
            from_email="noreply@example.com",
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({"message": "OTP sent to your email."}, status=status.HTTP_200_OK)


# Helper function to generate random password
def generate_random_password(length=8):
    if length < 4:
        raise ValueError("Password length must be at least 4 characters to include all required types.")

    # Define allowed character sets
    upper = random.choice(string.ascii_uppercase)
    lower = random.choice(string.ascii_lowercase)
    digit = random.choice(string.digits)
    special_chars = '*&#?/'
    special = random.choice(special_chars)

    # Pool of allowed characters
    allowed_chars = string.ascii_letters + string.digits + special_chars
    remaining = random.choices(allowed_chars, k=length - 4)

    # Combine and shuffle
    password_list = [upper, lower, digit, special] + remaining
    random.shuffle(password_list)

    return ''.join(password_list)


# View to verify OTP and register user
class VerifyOTPAndRegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        user_type = request.data.get('user_type')  # 'internal' or 'external'

        if not email or not otp or not user_type:
            return Response({"error": "Email, OTP, and user type are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Verify OTP
        cached_otp = cache.get(f"otp_{email}")
        if str(cached_otp) != otp:
            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate user ID and password
        password_plain = generate_random_password()
        password_hashed = make_password(password_plain)

        if user_type == 'internal':
            user_id = f"INT{random.randint(1000, 9999)}"
            data = {
                'first_name': request.data.get('first_name'),
                'last_name': request.data.get('last_name'),
                'gender': request.data.get('gender'),
                'email': email,
                'phone_number': request.data.get('phone_number'),
                'user_id': user_id,
                'password': password_hashed,
                'employee_id': request.data.get('employee_id'),
                'designation': request.data.get('designation'),
            }
            serializer = InternalCandidateSerializer(data=data)

        elif user_type == 'external':
            user_id = f"EXT{random.randint(1000, 9999)}"
            data = {
                'first_name': request.data.get('first_name'),
                'last_name': request.data.get('last_name'),
                'gender': request.data.get('gender'),
                'email': email,
                'phone_number': request.data.get('phone_number'),
                'user_id': user_id,
                'password': password_hashed,
                'dob': request.data.get('dob'),
                'address': request.data.get('address'),
                'pin_code': request.data.get('pin_code'),
                'city': request.data.get('city'),
                'aadhar_number': request.data.get('aadhar_number'),
                'highest_qualification': request.data.get('highest_qualification'),
            }
            serializer = ExternalCandidateSerializer(data=data)

        else:
            return Response({"error": "Invalid user type."}, status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            serializer.save()

            # Send confirmation email with User ID and Password
            send_mail(
                subject="Registration Successful",
                message=f"""Welcome {data['first_name']} {data['last_name']},

                Your registration was successful.
                User ID: {user_id}
                Password: {password_plain}
                Please keep these credentials secure.
                """,
                from_email="noreply@example.com",
                recipient_list=[email],
                fail_silently=False,
            )

            # Clear the OTP from cache
            cache.delete(f"otp_{email}")

            return Response({"message": "Registration successful."}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#LOGIN LOGIC
class LoginView(APIView):
    def post(self, request):
        print("Login request data:", request.data)

        user_id = request.data.get('user_id')
        password = request.data.get('password')
        login_type = request.data.get('login_type')

        if not user_id or not password or not login_type:
            return Response({"error": "User ID, password, and login_type are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        if login_type == 'admin':
            try:
                admin_user = User.objects.get(email=user_id)
                if check_password(password, admin_user.password):
                    refresh = RefreshToken.for_user(admin_user)
                    return Response({
                        "message": "Admin login successful",
                        "role": "admin",
                        "access": str(refresh.access_token),
                        "refresh": str(refresh)
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Incorrect password"}, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                return Response({"error": "Admin not found"}, status=status.HTTP_404_NOT_FOUND)

        elif login_type == 'candidate':
            try:
                candidate = InternalCandidate.objects.filter(user_id=user_id).first() or \
                            ExternalCandidate.objects.filter(user_id=user_id).first()

                if candidate and check_password(password, candidate.password):
                    # Create/get a temp user for JWT
                    temp_user, _ = User.objects.get_or_create(username=f"{login_type}_{user_id}")
                    refresh = RefreshToken.for_user(temp_user)

                    return Response({
                        "message": "Candidate login successful",
                        "role": "internal" if isinstance(candidate, InternalCandidate) else "external",
                        "candidate_id": str(candidate.id),
                        "access": str(refresh.access_token),
                        "refresh": str(refresh)
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

            except Exception as e:
                print(f"Error during candidate login: {e}")
                return Response({"error": "Something went wrong"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:
            return Response({"error": "Invalid login type"}, status=status.HTTP_400_BAD_REQUEST)


# View to get candidate details
class CandidateListView(APIView):
    def get(self, request):
        # Apply the filtering on InternalCandidate
        internal_candidates = InternalCandidate.objects.all()
        external_candidates = ExternalCandidate.objects.all()

        # Use the CandidateFilter for internal candidates
        internal_filter = CandidateFilter(request.query_params, queryset=internal_candidates)
        internal_candidates = internal_filter.qs  # Get filtered results

        # Filter for external candidates can be added as needed, e.g.:
        # (You can also create a separate filter for ExternalCandidate if needed)

        # Serialize the filtered data
        internal_data = InternalCandidateSerializer(internal_candidates, many=True).data
        external_data = ExternalCandidateSerializer(external_candidates, many=True).data

        # Return the filtered results
        return Response({
            "internal_candidates": internal_data,
            "external_candidates": external_data
        }, status=status.HTTP_200_OK)  


# Cache timeout (e.g., OTP is valid for 10 minutes)
# View to send OTP for password reset
class SendResetOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the user exists
        try:
            user = ExternalCandidate.objects.get(email=email)
        except ExternalCandidate.DoesNotExist:
            try:
                user = InternalCandidate.objects.get(email=email)
            except InternalCandidate.DoesNotExist:
                return Response({"error": "No user found with this email address"}, status=status.HTTP_404_NOT_FOUND)

        # Generate OTP
        otp = generate_otp()

        # Save OTP in cache with a timeout of 10 minutes (600 seconds)
        cache.set(f"otp_{email}", otp, timeout=600)

        # Send OTP to the email
        send_mail(
            subject="Your OTP for Password Reset",
            message=f"Your OTP is {otp}. It is valid for 10 minutes.",
            from_email="noreply@example.com",
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({"message": "OTP sent to your email."}, status=status.HTTP_200_OK)

# View to reset password using OTP
from django.core.mail import send_mail
from django.conf import settings

class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("newPassword")

        if not email or not otp or not new_password:
            return Response({"error": "Email, OTP and new password are required."}, status=status.HTTP_400_BAD_REQUEST)

        cached_otp = cache.get(f"otp_{email}")
        if not cached_otp or cached_otp != otp:
            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the user exists
        user = None
        try:
            user = ExternalCandidate.objects.get(email=email)
        except ExternalCandidate.DoesNotExist:
            try:
                user = InternalCandidate.objects.get(email=email)
            except InternalCandidate.DoesNotExist:
                return Response({"error": "No user found with this email address"}, status=status.HTTP_404_NOT_FOUND)

        # ✅ Hash the new password and update
        user.password = make_password(new_password)
        user.save()

        # ✅ Clear the OTP
        cache.delete(f"otp_{email}")

        # ✅ Send email notification
        subject = "Your password has been changed"
        message = f"""Hi {user.first_name},

This is to inform you that your password has been successfully changed.

Your User ID: {user.user_id}
Your New Password: {new_password}

If you did not request this change, please contact support immediately.

Regards,
Exam Room Support Team
"""
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)

        return Response({"message": "Password reset successful!"}, status=status.HTTP_200_OK)

from django.core.mail import send_mail
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from .models import InternalCandidate, ExternalCandidate
from .serializers import InternalCandidateSerializer, ExternalCandidateSerializer
import random
import string


# Helper function to generate OTP
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
        if cached_otp != otp:
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



#LOGIN VIEW
class LoginView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        password = request.data.get('password')

        if not user_id or not password:
            return Response({"error": "User ID and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = None
        user_type = None

        # Check in InternalCandidate
        try:
            user = InternalCandidate.objects.get(user_id=user_id)
            user_type = 'internal'
        except InternalCandidate.DoesNotExist:
            pass

        # Check in ExternalCandidate if not found internally
        if not user:
            try:
                user = ExternalCandidate.objects.get(user_id=user_id)
                user_type = 'external'
            except ExternalCandidate.DoesNotExist:
                return Response({"error": "Invalid User ID or password."}, status=status.HTTP_401_UNAUTHORIZED)

        # Verify password
        if not check_password(password, user.password):
            return Response({"error": "Invalid User ID or password."}, status=status.HTTP_401_UNAUTHORIZED)

        # Serialize and return user data (excluding password)
        serializer_class = InternalCandidateSerializer if user_type == 'internal' else ExternalCandidateSerializer
        serialized_user = serializer_class(user).data
        serialized_user.pop('password', None)  # Remove password from response

        return Response({
            "message": "Login successful.",
            "user_type": user_type,
            "user_data": serialized_user
        }, status=status.HTTP_200_OK)
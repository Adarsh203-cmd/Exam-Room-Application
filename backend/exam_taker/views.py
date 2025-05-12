from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from exam_allotment.models import ExamAssignment
from candidate_enrollment.utils import authenticate_candidate
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from candidate_enrollment.models import InternalCandidate, ExternalCandidate
from django.utils import timezone
from exam_content.models import MCQQuestion, FillInTheBlankQuestion
from exam_allotment.models import exam_creation
from .models import ExamAttempt, MCQAnswer, FIBAnswer


class ExamLoginView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        password = request.data.get('password')
        exam_token = request.data.get('exam_token')

        if not user_id or not password or not exam_token:
            return Response({"error": "Missing credentials or exam token"},
                            status=status.HTTP_400_BAD_REQUEST)

        # Step 1: Authenticate user
        auth_data, candidate = authenticate_candidate(user_id, password)
        if not auth_data:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Step 2: Check if candidate is assigned to this exam
        try:
            assignment = ExamAssignment.objects.get(user_id=user_id, exam_token=exam_token)
        except ExamAssignment.DoesNotExist:
            return Response({"error": "Unauthorized: Exam not assigned or invalid token"},
                            status=status.HTTP_403_FORBIDDEN)
        except ExamAssignment.MultipleObjectsReturned:
            # This case handles when multiple assignments are found for the same user and token
            return Response({"error": "Multiple exam assignments found for the same user and token. Contact admin."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Step 3: Return auth + exam info
        return Response({
            "message": "Login successful and exam verified",
            "candidate_id": str(candidate.id),
            "role": auth_data.get("role"),
            "exam_token": exam_token,
            "access": auth_data.get("access"),
            "refresh": auth_data.get("refresh"),
        }, status=status.HTTP_200_OK)


class ExamDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # this is the temp_user created during login
        username = user.username  # e.g., 'candidate_12345'

        # Extract actual user_id from temp_user.username
        if "_" in username:
            _, user_id = username.split("_", 1)
        else:
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

        # Try to fetch candidate info
        candidate = InternalCandidate.objects.filter(user_id=user_id).first() or \
                    ExternalCandidate.objects.filter(user_id=user_id).first()

        if not candidate:
            return Response({"error": "Candidate not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "message": f"Welcome {candidate.first_name}!",
            "candidate_id": str(candidate.id),
            "user_id": candidate.user_id,
            "role": "internal" if isinstance(candidate, InternalCandidate) else "external"
        }, status=status.HTTP_200_OK)


class StartExamView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        username = user.username
        _, user_id = username.split("_", 1)

        exam_token = request.query_params.get('exam_token')
        if not exam_token:
            return Response({"error": "Missing exam token"}, status=400)

        # Ensure we are getting the assignment for the correct user_id and exam_token
        try:
            assignment = ExamAssignment.objects.get(user_id=user_id, exam_token=exam_token)
        except ExamAssignment.DoesNotExist:
            return Response({"error": "Exam assignment not found for the given token"}, status=404)
        except ExamAssignment.MultipleObjectsReturned:
            return Response({"error": "Multiple exam assignments found for the same user and token. Contact admin."},
                            status=status.HTTP_400_BAD_REQUEST)

        # If exam has already started
        if assignment.exam_start_time:
          try:
            attempt = ExamAttempt.objects.get(assignment=assignment)
          except ExamAttempt.DoesNotExist:
             # Handle case where exam was started but attempt record missing
            # Option 1: Recreate attempt safely
            attempt = ExamAttempt.objects.create(
            assignment=assignment,
            exam=assignment.exam,
          )

          return Response({
           "message": "Exam already started",
           "start_time": assignment.exam_start_time,
           "duration_minutes": assignment.duration_minutes,
          "attempt_id": str(attempt.attempt_id),
          })

        # Set start time
        assignment.exam_start_time = timezone.now()
        assignment.save()

        # Create ExamAttempt
        attempt = ExamAttempt.objects.create(
            assignment=assignment,
            exam=assignment.exam,  # make sure your ExamAssignment has a ForeignKey to exam
        )

        return Response({
            "message": "Exam started",
            "start_time": assignment.exam_start_time,
            "duration_minutes": assignment.duration_minutes,
            "attempt_id": str(attempt.attempt_id),
        })


#Fetch questions for the exam


class FetchExamQuestionsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        exam_token = request.query_params.get('exam_token')

        if not exam_token:
            return Response({"error": "Missing exam token"}, status=400)

        try:
            exam = exam_creation.objects.get(exam_token=exam_token)
        except exam_creation.DoesNotExist:
            return Response({"error": "Invalid exam token"}, status=404)

        # Fetch MCQs
        mcq_questions = MCQQuestion.objects.filter(id__in=exam.mcq_question_ids)
        mcq_data = [{
            "id": q.id,
            "type": "MCQ",
            "subject": q.subject,
            "question_text": q.question_text,
            "options": q.options,
            "answer_type": q.answer_type,
            "difficulty": q.difficulty,
            "marks": q.marks
        } for q in mcq_questions]

        # Fetch Fill in the Blanks
        fib_questions = FillInTheBlankQuestion.objects.filter(id__in=exam.fib_question_ids)
        fib_data = [{
            "id": q.id,
            "type": "FIB",
            "subject": q.subject,
            "question_text": q.question_text,
            "difficulty": q.difficulty,
            "marks": q.marks
        } for q in fib_questions]

        # Combine
        all_questions = mcq_data + fib_data

        return Response({
            "message": "Questions fetched successfully",
            "exam_title": exam.exam_title,
            "instructions": exam.instruction,
            "exam_uuid": str(exam.exam_uuid),
            "questions": all_questions
        })

#Answer submission
class SubmitAnswersView(APIView):
    def post(self, request):
        attempt_id = request.data.get('attempt_id')
        mcq_answers = request.data.get('mcq_answers', [])
        fib_answers = request.data.get('fib_answers', [])

        try:
            attempt = ExamAttempt.objects.get(attempt_id=attempt_id)
        except ExamAttempt.DoesNotExist:
            return Response({'error': 'Invalid attempt_id'}, status=400)

        if attempt.is_submitted:
            return Response({'error': 'Answers already submitted'}, status=400)

        for mcq in mcq_answers:
            try:
                question = MCQQuestion.objects.get(id=mcq['question_id'])
                MCQAnswer.objects.update_or_create(
                    attempt=attempt,
                    question=question,
                    defaults={'selected_options': mcq['selected_options']}
                )
            except MCQQuestion.DoesNotExist:
                continue

        for fib in fib_answers:
            try:
                question = FillInTheBlankQuestion.objects.get(id=fib['question_id'])
                FIBAnswer.objects.update_or_create(
                    attempt=attempt,
                    question=question,
                    defaults={'user_response': fib['user_response']}
                )
            except FillInTheBlankQuestion.DoesNotExist:
                continue

        attempt.is_submitted = True
        attempt.ended_at = timezone.now()
        attempt.duration_seconds = (attempt.ended_at - attempt.started_at).seconds
        attempt.save()

        return Response({'message': 'Answers submitted successfully'}, status=200)
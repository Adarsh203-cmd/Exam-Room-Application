import random
import secrets
import string
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.mail import send_mail
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from .models import exam_creation, ExamAssignment
from .serializers import (
    ExamCreationSerializer,
    CandidateExamAssignmentSerializer,
    ExamDetailSerializer,
)
from exam_content.models import MCQQuestion, FillInTheBlankQuestion
from exam_content.serializers import MCQQuestionSerializer, FillBlankQuestionSerializer
from candidate_enrollment.models import InternalCandidate, ExternalCandidate


# ----- Dynamic Subject & Question Endpoints -----

class SubjectListView(APIView):
    """ GET /api/exam_allotment/subjects/ """
    def get(self, request):
        mcq_subs = MCQQuestion.objects.values_list('subject', flat=True).distinct()
        fib_subs = FillInTheBlankQuestion.objects.values_list('subject', flat=True).distinct()
        subjects = list(set(mcq_subs) | set(fib_subs))
        return Response(subjects)


class RandomQuestionsView(APIView):
    """ GET /api/exam_allotment/random-questions/?subject=SUBJ&mcq_count=N&fib_count=M """
    def get(self, request):
        subject = request.query_params.get('subject')
        mcq_count = int(request.query_params.get('mcq_count') or 0)
        fib_count = int(request.query_params.get('fib_count') or 0)

        if not subject or (mcq_count <= 0 and fib_count <= 0):
            return Response({"error": "Provide subject and counts > 0"}, status=status.HTTP_400_BAD_REQUEST)

        mcqs = list(MCQQuestion.objects.filter(subject=subject))
        fibs = list(FillInTheBlankQuestion.objects.filter(subject=subject))

        mcq_sample = random.sample(mcqs, min(mcq_count, len(mcqs)))
        fib_sample = random.sample(fibs, min(fib_count, len(fibs)))

        return Response({
            'mcq': MCQQuestionSerializer(mcq_sample, many=True).data,
            'fib': FillBlankQuestionSerializer(fib_sample, many=True).data
        })


# ----- Exam Creation & Detail -----

class ExamCreationViewSet(viewsets.ModelViewSet):
    """ CRUD for /api/exam_allotment/exams/ """
    queryset = exam_creation.objects.all()
    serializer_class = ExamCreationSerializer

    def generate_exam_token(self, length=10):
        chars = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(chars) for _ in range(length))

    def create(self, request, *args, **kwargs):
        data = request.data
        required = [
            'exam_title', 'instruction', 'exam_start_time', 'exam_end_time',
            'created_by', 'role_or_department', 'mcq_question_ids', 'fib_question_ids'
        ]
        missing = [f for f in required if f not in data]
        if missing:
            return Response({"error": f"Missing fields: {missing}"}, status=status.HTTP_400_BAD_REQUEST)

        token = self.generate_exam_token()
        exam = exam_creation.objects.create(
            exam_title=data['exam_title'],
            instruction=data['instruction'],
            exam_start_time=data['exam_start_time'],
            exam_end_time=data['exam_end_time'],
            created_by=int(data['created_by']),
            role_or_department=data['role_or_department'],
            mcq_question_ids=data.get('mcq_question_ids', []),
            fib_question_ids=data.get('fib_question_ids', []),
            location=data.get('location', ''),
            exam_token=token,
            exam_url=f"http://localhost:5173/login/{token}"
        )
        return Response(ExamCreationSerializer(exam).data, status=status.HTTP_201_CREATED)


class ExamDetailView(APIView):
    """ GET /api/exam_allotment/exams/{token}/questions/ """
    def get(self, request, token):
        exam = get_object_or_404(exam_creation, exam_token=token)
        mcq_qs = MCQQuestion.objects.filter(id__in=exam.mcq_question_ids)
        fib_qs = FillInTheBlankQuestion.objects.filter(id__in=exam.fib_question_ids)
        return Response(ExamDetailSerializer({'exam': exam, 'mcq': mcq_qs, 'fib': fib_qs}).data)


# ----- Candidate Enrollment & Assignment -----

class CandidateExamAssignmentViewSet(viewsets.ModelViewSet):
    """ CRUD for /api/exam_allotment/assignments/ """
    queryset = ExamAssignment.objects.all()
    serializer_class = CandidateExamAssignmentSerializer

class CandidateSelectionView(APIView):
    """ GET lists candidates; POST sends emails and stores assignments """

    def get(self, request):
        internal = InternalCandidate.objects.all()
        external = ExternalCandidate.objects.all()

        def serialize(c, kind):
            d = {
                'id': str(c.id), 'user_id': c.user_id,
                'first_name': c.first_name, 'last_name': c.last_name,
                'email': c.email, 'type': kind
            }
            if kind == 'internal':
                d.update({'employee_id': c.employee_id, 'designation': c.designation})
            else:
                d.update({'dob': c.dob, 'city': c.city})
            return d

        data = [serialize(c, 'internal') for c in internal] + [serialize(c, 'external') for c in external]
        return Response(data)

    def post(self, request):
        exam_token = request.data.get('exam_token')
        selected = request.data.get('selected_candidates') or []

        if not exam_token:
            return Response({"error": "Exam token required"}, status=status.HTTP_400_BAD_REQUEST)
        if not selected:
            return Response({"error": "No candidates selected"}, status=status.HTTP_400_BAD_REQUEST)

        exam = get_object_or_404(exam_creation, exam_token=exam_token)
        exam_location = exam.location or ""

        interns = InternalCandidate.objects.filter(id__in=selected)
        externs = ExternalCandidate.objects.filter(id__in=selected)

        assignments = []

        for c in list(interns) + list(externs):
            # Build email context
            subj = f"Your Invitation: {exam.exam_title}"
            to_email = c.email
            from_email = settings.EMAIL_HOST_USER

            context = {
                "first_name": c.first_name,
                "last_name": c.last_name,
                "user_id": c.user_id,
                "exam_title": exam.exam_title,
                "start_time": exam.exam_start_time,
                "end_time": exam.exam_end_time,
                "location": exam_location,
                "exam_url": exam.exam_url,
                "logo_url": "https://res.cloudinary.com/dwybblnpz/image/upload/ChatGPT_Image_May_14_2025_02_21_41_PM_ovhtkx_c_crop_w_810_h_389_x_0_y_0_szcgmn.png",
            }

            # Render HTML and text
            html_content = render_to_string("emails/exam_invitation.html", context)
            text_content = (
                f"Dear {c.first_name} {c.last_name},\n\n"
                f"You are invited to the recruitment exam “{exam.exam_title}”.\n\n"
                f"User ID: {c.user_id}\n"
                f"Your password was sent in your registration email.\n\n"
                f"Start Time: {exam.exam_start_time}\n"
                f"End Time:   {exam.exam_end_time}\n"
                f"Examination Center: {exam_location}\n\n"
                f"To begin your exam, open this link:\n{exam.exam_url}\n\n"
                "Good luck!\nRecruitment Team"
            )

            # Send email
            msg = EmailMultiAlternatives(subj, text_content, from_email, [to_email])
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=False)

            # Create assignment record
            assignment = ExamAssignment(
                exam_token=exam.exam_token,
                url_link=exam.exam_url,
                invitation_sent_flag=True,
                location=exam_location,
                exam_start_time=exam.exam_start_time,
                exam_end_time=exam.exam_end_time,
                user_id=c.user_id,
                first_name=c.first_name,
                last_name=c.last_name,
                email=c.email,
                password=c.password,
            )
            if isinstance(c, InternalCandidate):
                assignment.internal_candidate = c
            else:
                assignment.external_candidate = c

            assignment.save()
            assignments.append(assignment)

        # Return summary response
        return Response({
            "message": "Emails sent and assignments created successfully.",
            "assignments": [
                {
                    "assignment_id": a.assignment_id,
                    "exam_token":    a.exam_token,
                    "url_link":      a.url_link,
                    "exam_start_time": a.exam_start_time,
                    "exam_end_time":   a.exam_end_time,
                } for a in assignments
            ]
        }, status=status.HTTP_200_OK)

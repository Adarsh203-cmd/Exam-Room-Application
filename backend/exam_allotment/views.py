

from django.shortcuts import render
from rest_framework import viewsets
from .models import exam_creation, exam_enrollment, CandidateExamAssignment, ExamSyllabusAndQuestion
from .serializers import *

class ExamViewSet(viewsets.ModelViewSet):
    queryset = exam_creation.objects.all()
    serializer_class = ExamSerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = exam_enrollment.objects.all()
    serializer_class = EnrollmentSerializer

class CandidateExamAssignmentViewSet(viewsets.ModelViewSet):
    queryset = CandidateExamAssignment.objects.all()
    serializer_class = CandidateExamAssignmentSerializer

class ExamSyllabusAndQuestionViewSet(viewsets.ModelViewSet):
    queryset = ExamSyllabusAndQuestion.objects.all()
    serializer_class = ExamSyllabusAndQuestionSerializer



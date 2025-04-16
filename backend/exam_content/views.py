from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets
from .models import MCQQuestion, FillInTheBlankQuestion
from .serializers import MCQQuestionSerializer, FillInTheBlankSerializer

class MCQQuestionViewSet(viewsets.ModelViewSet):
    queryset = MCQQuestion.objects.all()
    serializer_class = MCQQuestionSerializer

class FillInTheBlankViewSet(viewsets.ModelViewSet):
    queryset = FillInTheBlankQuestion.objects.all()
    serializer_class = FillInTheBlankSerializer


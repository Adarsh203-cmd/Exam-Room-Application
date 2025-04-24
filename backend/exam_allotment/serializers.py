

from rest_framework import serializers
from .models import exam_creation, exam_enrollment, CandidateExamAssignment, ExamSyllabusAndQuestion

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = exam_creation
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = exam_enrollment
        fields = '__all__'

class CandidateExamAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateExamAssignment
        fields = '__all__'

class ExamSyllabusAndQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamSyllabusAndQuestion
        fields = '__all__'


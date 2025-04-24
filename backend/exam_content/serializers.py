from rest_framework import serializers
from .models import MCQQuestion, FillInTheBlankQuestion

class MCQQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQQuestion
        fields = '__all__'

class FillBlankQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FillInTheBlankQuestion
        fields = '__all__'
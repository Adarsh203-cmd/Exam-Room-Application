# backend/exam_allotment/serializers.py

from rest_framework import serializers
from .models import exam_creation, ExamAssignment
from exam_content.serializers import MCQQuestionSerializer, FillBlankQuestionSerializer

class ExamCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = exam_creation
        fields = '__all__'
        read_only_fields = [
            'id','exam_url','exam_token','created_at',
            'exam_uuid','total_marks'
        ]


class CandidateExamAssignmentSerializer(serializers.ModelSerializer):
    # expose the dynamic properties on the model
    exam_start_time   = serializers.DateTimeField(source='exam_start_time',   read_only=True)
    exam_end_time     = serializers.DateTimeField(source='exam_end_time',     read_only=True)
    current_password  = serializers.CharField      (source='current_password', read_only=True)

    class Meta:
        model = ExamAssignment
        fields = [
            'assignment_id','exam','internal_candidate','external_candidate',
            'user_id','first_name','last_name','email','password','location',
            'url_link','invitation_sent_flag','exam_token',
            'created_at',
            # our three new read-only fields:
            'exam_start_time','exam_end_time','current_password',
        ]
        read_only_fields = [
            'assignment_id','created_at',
            'exam_start_time','exam_end_time','current_password'
        ]


class ExamDetailSerializer(serializers.Serializer):
    exam = ExamCreationSerializer()
    mcq  = MCQQuestionSerializer(many=True)
    fib  = FillBlankQuestionSerializer(many=True)

# dashboard_module/serializers.py

from rest_framework import serializers
from exam_allotment.models import exam_creation,ExamAssignment

class ExamCreationSerializer(serializers.ModelSerializer):
    """
    Serializer for the exam_creation model.
    Converts exam_creation instances to JSON format and vice versa.
    """
    class Meta:
        model = exam_creation
        fields = (
            'id', 'exam_uuid', 'exam_title', 'instruction',
            'exam_start_time', 'exam_end_time', 'role_or_department',
            'location', 'number_of_questions', 'total_marks'
        )

class ExamAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for the exam_assignment model.
    Converts exam_assignment instances to JSON format and vice versa.
    """
    class Meta:
        model = ExamAssignment
        fields = (
            'assignment_id', 'user_id', 'first_name', 'last_name',
            'email',  'created_at',
            'exam_id', 'internal_candidate_id', 'external_candidate_id',
            'location', 'exam_start_time', 'exam_end_time'
        )


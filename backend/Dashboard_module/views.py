from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from exam_allotment.models import exam_creation,ExamAssignment
from .serializers import ExamCreationSerializer,ExamAssignmentSerializer
from django.utils import timezone

@api_view(['GET'])
def exam_list(request):
    """
    View to list all exams.
    """
    # Fetch all exam creation records
    exams = exam_creation.objects.all()

    # Serialize the exam data
    serializer = ExamCreationSerializer(exams, many=True)

    # Return the serialized data as JSON
    return Response(serializer.data)


@api_view(['GET'])
def exam_detail(request, exam_uuid):
    """
    View to retrieve details of a single exam by its UUID.
    """
    try:
        # Fetch the exam based on UUID
        exam = exam_creation.objects.get(exam_uuid=exam_uuid)

    except exam_creation.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)

    # Serialize the exam data
    serializer = ExamCreationSerializer(exam)

    # Return the serialized data as JSON
    return Response(serializer.data)


@api_view(['GET'])
def exam_dashboard(request):
    """
    View to return dashboard statistics including:
    - Total count of exams
    - Count of upcoming exams
    - Details of upcoming exams (id, title, start_time, end_time, location)
    """
    # Get the total count of exams created
    total_exams_count = exam_creation.objects.count()

    # Get the current time
    current_time = timezone.now()

    # Get the upcoming exams (exams whose start time is greater than the current time)
    upcoming_exams = exam_creation.objects.filter(exam_start_time__gt=current_time)

    # Get the count of upcoming exams
    upcoming_exams_count = upcoming_exams.count()

    # Fetch upcoming exam details: id, exam_title, start_time, end_time, location
    upcoming_exam_details = upcoming_exams.values(
        'id', 'exam_title', 'exam_start_time', 'exam_end_time', 'location'
    )

    # Prepare the data for the dashboard response
    dashboard_data = {
        'total_exams_count': total_exams_count,
        'upcoming_exams_count': upcoming_exams_count,
        'upcoming_exam_details': list(upcoming_exam_details)  # Convert to list for JSON response
    }

    # Return the dashboard data as JSON
    return Response(dashboard_data)

@api_view(['GET'])
def exam_assignments_by_exam(request, exam_id):
    """
    View to retrieve all exam assignments for a given exam_id.
    """
    assignments = ExamAssignment.objects.filter(exam_id=exam_id)

    if not assignments.exists():
        return Response({'message': 'No assignments found for this exam_id.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ExamAssignmentSerializer(assignments, many=True)
    return Response(serializer.data)

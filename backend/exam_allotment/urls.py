from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubjectListView,
    RandomQuestionsView,
    ExamCreationViewSet,
    ExamDetailView,
    CandidateExamAssignmentViewSet,
    CandidateSelectionView,  # Import the new view
    ScheduledExamsView, CompletedExamsView
)

router = DefaultRouter()
router.register(r'exams', ExamCreationViewSet, basename='exam')
router.register(r'assignments', CandidateExamAssignmentViewSet, basename='assignment')

urlpatterns = [
    path('', include(router.urls)),
    path('subjects/', SubjectListView.as_view(), name='subject-list'),
    path('random-questions/', RandomQuestionsView.as_view(), name='random-questions'),
    path('exams/<str:token>/questions/', ExamDetailView.as_view(), name='exam-detail'),
    
    # Add the new URL for selecting candidates and sending emails
    path('select-candidates/', CandidateSelectionView.as_view(), name='select-candidates'),
  #  path('exams/scheduled/', ScheduledExamsView.as_view(), name='exams-scheduled'),
   # path('exams/completed/', CompletedExamsView.as_view(), name='exams-completed'),
    path('exams/scheduled/', ScheduledExamsView.as_view(), name='exams-scheduled'),
    path('exams/completed/', CompletedExamsView.as_view(), name='exams-completed'),
]



from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'exams', views.ExamViewSet)
router.register(r'enrollments', views.EnrollmentViewSet)
router.register(r'assignments', views.CandidateExamAssignmentViewSet)
router.register(r'syllabus', views.ExamSyllabusAndQuestionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]




from django.urls import path
from . import views

urlpatterns = [
    path('exams/', views.exam_list, name='exam_list'),  # For listing all exams
    path('exams/<uuid:exam_uuid>/', views.exam_detail, name='exam_detail'),
    path("total-upcomingexams/", views.exam_dashboard, name="exam-dashboard"),   # For retrieving a single exam by UUID
    path('assignments/exam/<int:exam_id>/', views.exam_assignments_by_exam, name='exam_assignments_by_exam'),    
]

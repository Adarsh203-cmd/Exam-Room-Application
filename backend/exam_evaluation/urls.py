from django.urls import path
from . import views
from .views import (
    evaluate_exam,
    get_result,
    get_candidate_results,
    get_exam_statistics,
    get_exam_details
) 

urlpatterns = [
    # Evaluate an exam attempt
    path('evaluate/<uuid:attempt_id>/', views.evaluate_exam, name='evaluate_exam'),
    
    # Get details of a specific result
    path('result/<int:result_id>/', views.get_result, name='get_result'),
    
    # Get all results for a specific candidate
    path('candidate-results/<str:user_id>/', views.get_candidate_results, name='candidate_results'),
    
    # Get statistics for a specific exam
    path('exam-statistics/<int:exam_id>/', views.get_exam_statistics, name='exam_statistics'),

    path('exams', views.get_all_exam_attempts, name='get_all_exam_attempts'),
    path('dashboard-stats', views.get_dashboard_stats, name='get_dashboard_stats'),
    path('all-exams', views.all_exams),
    path('upcoming-exams', views.upcoming_exams),
    path('exam-details/<int:exam_id>/', views.get_exam_details, name='get_exam_details'),
]
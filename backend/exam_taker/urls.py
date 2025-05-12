# exam_taker/urls.py

from django.urls import path
from .views import ExamLoginView, ExamDashboardView, StartExamView, FetchExamQuestionsView, SubmitAnswersView

urlpatterns = [
    path('exam-login/', ExamLoginView.as_view(), name='exam-login'),
    path('exam-dashboard/', ExamDashboardView.as_view(), name='exam-dashboard'),
    path('start-exam/', StartExamView.as_view(), name='start-exam'), #http://127.0.0.1:8000/api/exam-view/start-exam/?exam_token=
    path('fetch-questions/', FetchExamQuestionsView.as_view(), name='fetch_exam_questions'),  #http://127.0.0.1:8000/api/exam-view/fetch-questions/?exam_token=
    path('submit-answers/', SubmitAnswersView.as_view(), name='submit-answers'),
]



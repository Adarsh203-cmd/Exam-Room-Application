from django.urls import path
from .views import (
    MCQQuestionCreateView, FillBlankQuestionCreateView,
    MCQListView, FillBlankListView,
    MCQDetailView, FillBlankDetailView
)

urlpatterns = [
    path("mcq/create/", MCQQuestionCreateView.as_view(), name="create-mcq"),
    path("fill/create/", FillBlankQuestionCreateView.as_view(), name="create-fill"),
    path("mcq/list/", MCQListView.as_view(), name="list-mcq"),
    path("fill/list/", FillBlankListView.as_view(), name="list-fill"),
    path("mcq/<uuid:pk>/", MCQDetailView.as_view(), name="mcq-detail"),
    path("fill/<uuid:pk>/", FillBlankDetailView.as_view(), name="fill-detail"),
]


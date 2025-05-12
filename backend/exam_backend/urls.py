from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/candidate/", include("candidate_enrollment.urls")),
    path('api/exam_allotment/', include('exam_allotment.urls')),  # ✅ Only this
    path("api/exam_content/", include("exam_content.urls")),
    path("api/exam-view/", include("exam_taker.urls")),

    # Remove this wrong line: path("api/exam/", include("exam_allotment.urls")),

    # JWT token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

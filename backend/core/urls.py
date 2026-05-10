from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet,
    AttendanceViewSet,
    LeaveRequestViewSet,
    CandidateViewSet,
    AssetViewSet,
    OnboardingViewSet, 
    PerformanceMetricViewSet,   # Updated: Matches your new ViewSet
    PerformanceReviewViewSet, 
    RegisterView,
    PayrollSummaryView,
    PerformanceStatsView,     
    send_invite_email
)

# 1. Create a router and register ViewSets
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'leaves', LeaveRequestViewSet)
router.register(r'candidates', CandidateViewSet)
router.register(r'assets', AssetViewSet)
router.register(r'onboarding', OnboardingViewSet)
router.register(r'metrics', PerformanceMetricViewSet)  # Updated: /api/metrics/
router.register(r'reviews', PerformanceReviewViewSet)  # /api/reviews/

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Registration endpoint
    path('register/', RegisterView.as_view(), name='register'),
    
    # Dashboard stats endpoints
    path('payroll/stats/', PayrollSummaryView.as_view(), name='payroll-stats'),
    path('performance/stats/', PerformanceStatsView.as_view(), name='performance-stats'),
    
    # Email invite
    path('send-invite/', send_invite_email, name='send_invite')
]

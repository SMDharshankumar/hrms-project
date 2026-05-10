# ── FRAMEWORK IMPORTS (no change) ───────────────────────────
from rest_framework import viewsets, status, generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from django.contrib.auth.models import User
from django.db.models import Sum, Avg, Count
from django.core.mail import send_mail

# ── MODELS IMPORT (no change) ────────────────────────────────
from .models import (
    Employee,
    Attendance,
    LeaveRequest,
    Candidate,
    Asset,
    Onboarding,
    PerformanceMetric,
    PerformanceReview
)

# ── SERIALIZERS IMPORT (this is what changed) ────────────────
from .serializers import (
    EmployeeListSerializer,      # for /employees/ list
    EmployeeDetailSerializer,    # for /employees/{id}/ detail
    AttendanceSerializer,
    LeaveRequestSerializer,
    RegisterSerializer,
    CandidateSerializer,
    AssetSerializer,
    OnboardingSerializer,
    PerformanceMetricSerializer,
    PerformanceReviewSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related(
        'user', 'reporting_manager'
    ).all()
    serializer_class = EmployeeListSerializer      # ← change this line
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'department']

    # WHY: This overrides serializer_class per action
    # list/create = lightweight, retrieve/update = full detail
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EmployeeDetailSerializer
        return EmployeeListSerializer

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        if request.method == 'GET':
            return Response(self.get_serializer(employee).data)

        serializer = self.get_serializer(
            employee, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('employee').all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related(
        'employee', 'approved_by'
    ).all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]


class PayrollSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = Employee.objects.aggregate(
            total_payout=Sum('salary'),
            avg_salary=Avg('salary'),
            total_staff=Count('id')
        )
        return Response({
            "total_payout": stats['total_payout'] or 0,
            "avg_salary":   round(stats['avg_salary'] or 0, 2),
            "total_staff":  stats['total_staff'] or 0
        })


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]


class OnboardingViewSet(viewsets.ModelViewSet):
    queryset = Onboarding.objects.select_related('employee').all()
    serializer_class = OnboardingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['employee__first_name', 'employee__last_name']


class PerformanceMetricViewSet(viewsets.ModelViewSet):
    queryset = PerformanceMetric.objects.select_related('employee').all()
    serializer_class = PerformanceMetricSerializer
    permission_classes = [IsAuthenticated]


class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.select_related(
        'employee', 'reviewer'
    ).all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [IsAuthenticated]


class PerformanceStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        review_stats = PerformanceReview.objects.aggregate(
            avg_rating=Avg('final_rating'),
            total_reviews=Count('id')
        )
        metric_stats = PerformanceMetric.objects.aggregate(
            avg_productivity=Avg('productivity'),
            avg_technical=Avg('technical_skills')
        )
        return Response({
            "avg_rating":      round(review_stats['avg_rating'] or 0, 1),
            "total_reviews":   review_stats['total_reviews'] or 0,
            "avg_productivity": round(metric_stats['avg_productivity'] or 0, 1),
            "avg_technical":   round(metric_stats['avg_technical'] or 0, 1),
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_invite_email(request):
    email = request.data.get('email')
    if not email:
        return Response(
            {"error": "Email is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        send_mail(
            'Invitation to Join',
            'You are invited to join our HRMS platform.',
            'your-email@gmail.com',
            [email],
            fail_silently=False,
        )
        return Response({"message": "Invite sent successfully!"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
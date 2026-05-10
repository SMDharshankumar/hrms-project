from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Employee, Attendance, LeaveRequest,
    Candidate, Asset, Onboarding,
    PerformanceMetric, PerformanceReview
)


# ── PERFORMANCE SERIALIZERS ──────────────────────────────────

class PerformanceMetricSerializer(serializers.ModelSerializer):
    # WHY: SerializerMethodField lets us combine first+last name
    employee_name = serializers.SerializerMethodField()

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    class Meta:
        model = PerformanceMetric
        fields = '__all__'


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    reviewer_name = serializers.SerializerMethodField()

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    def get_reviewer_name(self, obj):
        if obj.reviewer:
            return f"{obj.reviewer.first_name} {obj.reviewer.last_name}"
        return None  # reviewer can be null (SET_NULL in model)

    class Meta:
        model = PerformanceReview
        fields = '__all__'


# ── ATTENDANCE SERIALIZER ────────────────────────────────────

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'date',
            'check_in', 'check_out', 'location', 'is_late'
        ]


# ── LEAVE REQUEST SERIALIZER ─────────────────────────────────

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name', 'leave_type',
            'start_date', 'end_date', 'reason',
            'status', 'applied_on'
        ]


# ── REGISTRATION SERIALIZER ──────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        # WHY: Auto-create Employee profile on registration
        # so every user has a matching employee record
        Employee.objects.create(
            user=user,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            department='Unassigned',
            designation='New Hire',
            salary=0.00
        )
        return user


# ── EMPLOYEE SERIALIZERS (split for performance) ─────────────

# WHY: Lightweight version for lists — no nested data
# Loading 50 employees with all their leaves/metrics would be
# very slow. This returns only what the workforce cards need.
class EmployeeListSerializer(serializers.ModelSerializer):
    manager_name = serializers.ReadOnlyField(
        source='reporting_manager.first_name'
    )
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Employee
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'department', 'designation', 'salary',
            'current_status', 'join_date', 'manager_name'
        ]


# WHY: Full detail version for single employee profile page
# Only called when viewing one specific employee (/employees/{id}/)
class EmployeeDetailSerializer(serializers.ModelSerializer):
    attendances  = AttendanceSerializer(many=True, read_only=True)
    leaves       = LeaveRequestSerializer(many=True, read_only=True)
    metrics      = PerformanceMetricSerializer(many=True, read_only=True)
    reviews      = PerformanceReviewSerializer(many=True, read_only=True)
    manager_name = serializers.ReadOnlyField(
        source='reporting_manager.first_name'
    )
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Employee
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'department', 'designation', 'salary', 'current_status',
            'join_date', 'reporting_manager', 'manager_name',
            'attendances', 'leaves', 'metrics', 'reviews'
        ]


# ── TALENT / ATS SERIALIZER ──────────────────────────────────

class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = '__all__'


# ── ASSET SERIALIZER ─────────────────────────────────────────

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'


# ── ONBOARDING SERIALIZER ────────────────────────────────────

class OnboardingSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    class Meta:
        model = Onboarding
        fields = [
            'id', 'employee', 'employee_name',
            'task_name', 'is_completed', 'due_date'
        ]
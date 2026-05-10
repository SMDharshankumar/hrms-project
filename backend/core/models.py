from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

# --- WORKFORCE MANAGEMENT ---

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    
    reporting_manager = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='team_members'
    )
    
    current_status = models.CharField(
        max_length=20, 
        choices=[('active', 'Active'), ('away', 'Away'), ('on_leave', 'On Leave')],
        default='active'
    )
    join_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(auto_now_add=True)
    check_in = models.DateTimeField(auto_now_add=True)
    check_out = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    is_late = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Attendance Records"
        unique_together = ('employee', 'date')

class LeaveRequest(models.Model):
    LEAVE_TYPES = [('sick', 'Medical'), ('casual', 'Casual'), ('paid', 'Privilege')]
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Authorized'), ('rejected', 'Declined')]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leaves')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_on = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.employee.first_name} - {self.leave_type} ({self.status})"

# --- TALENT / ATS ---

class Candidate(models.Model):
    STAGE_CHOICES = [('applied', 'Applied'), ('screening', 'Screening'), ('interview', 'Interview'), ('hired', 'Hired'), ('rejected', 'Rejected')]
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STAGE_CHOICES, default='applied')
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.role}"

# --- PERFORMANCE MANAGEMENT SYSTEM (PMS) ---

class PerformanceMetric(models.Model):
    """Tracks numeric performance scores (KPIs) over time for charts"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='metrics')
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    # KPIs (Scale 1-5)
    technical_skills = models.IntegerField(default=3, validators=[MinValueValidator(1), MaxValueValidator(5)])
    productivity = models.IntegerField(default=3, validators=[MinValueValidator(1), MaxValueValidator(5)])
    communication = models.IntegerField(default=3, validators=[MinValueValidator(1), MaxValueValidator(5)])
    reliability = models.IntegerField(default=3, validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    # Calculated field for frontend "Avg Rating" cards
    overall_score = models.DecimalField(max_digits=3, decimal_places=1, editable=False)

    def save(self, *args, **kwargs):
        # Calculate average automatically
        total = self.technical_skills + self.productivity + self.communication + self.reliability
        self.overall_score = total / 4
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee.first_name} - Score: {self.overall_score} ({self.recorded_at.date()})"

class PerformanceReview(models.Model):
    """Stores formal periodic feedback and comments"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='reviews_given')
    review_date = models.DateField(auto_now_add=True)
    review_cycle = models.CharField(max_length=100, help_text="e.g., Q1 2024")
    
    final_rating = models.DecimalField(max_digits=3, decimal_places=1, validators=[MinValueValidator(1), MaxValueValidator(5)])
    manager_comments = models.TextField()
    self_assessment = models.TextField(blank=True, null=True)
    
    # Summary highlights
    key_strengths = models.TextField(blank=True)
    improvement_areas = models.TextField(blank=True)
    
    def __str__(self):
        return f"Review: {self.employee.last_name} - {self.review_cycle}"

# --- ASSETS & ONBOARDING ---

class Onboarding(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='onboarding_tasks')
    task_name = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.task_name} - {self.employee.first_name}"

class Asset(models.Model):
    asset_name = models.CharField(max_length=255)
    model = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='Workstation')
    status = models.CharField(max_length=50, default='available')

    def __str__(self):
        return f"{self.asset_name} ({self.model})"

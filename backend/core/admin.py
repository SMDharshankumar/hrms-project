from django.contrib import admin
from .models import Employee, PerformanceMetric, PerformanceReview

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'department', 'salary')
    search_fields = ('first_name', 'last_name', 'email')
    list_filter = ('department',)

# --- NEW: Add these to see your Performance System in Admin ---

@admin.register(PerformanceMetric)
class PerformanceMetricAdmin(admin.ModelAdmin):
    # This shows you the name and score at a glance
    list_display = ('employee', 'overall_score', 'technical_skills', 'productivity', 'recorded_at')
    list_filter = ('recorded_at',)

@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = ('employee', 'final_rating', 'review_date')

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # AUTH: These provide the tokens needed for your Profile Page
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ← ADDED: This gives Login button on DRF browser page
    path('api-auth/', include('rest_framework.urls')),

    # API: This routes all HRMS logic to your core app
    path('api/', include('core.urls')), 
]
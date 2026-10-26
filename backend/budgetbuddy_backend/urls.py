from django.contrib import admin
from django.urls import path, include
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def root_api_status(request):
    return Response({
        "project": "BudgetBuddy API",
        "description": "A Full-Stack Personal Budget Planning and Expense Management Platform",
        "version": "1.0.0",
        "status": "Operational",
        "endpoints": {
            "admin": "/admin/",
            "register": "/api/auth/register/",
            "login": "/api/auth/login/",
            "token_refresh": "/api/auth/token/refresh/",
            "me": "/api/auth/me/",
            "profile": "/api/auth/profile/",
            "logout": "/api/auth/logout/",
            "finance_overview": "/api/finance/overview/"
        }
    })

urlpatterns = [
    path('', root_api_status, name='root_status'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls', namespace='authentication')),
    path('api/finance/', include('finance.urls', namespace='finance')),
]

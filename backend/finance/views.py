from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

class FinanceOverviewAPIView(APIView):
    """
    Overview endpoint returning available financial modules and schema info.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "BudgetBuddy Financial Services are active.",
            "user": request.user.username,
            "role": request.user.role,
            "modules": [
                "Income Management",
                "Expense Tracking",
                "Monthly Budgets",
                "Savings Goals",
                "Notification Alerts",
                "Financial Reports"
            ]
        }, status=status.HTTP_200_OK)

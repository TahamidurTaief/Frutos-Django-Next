# wholesale/permissions.py
from rest_framework.permissions import BasePermission
from .models import WholesaleUser, ApplicationStatus


class IsWholesaleUser(BasePermission):
    """Allows access only to authenticated WholesaleUser instances."""
    message = 'Wholesale account required.'

    def has_permission(self, request, view):
        return (
            request.user is not None
            and isinstance(request.user, WholesaleUser)
            and request.user.is_active
        )


class IsApprovedWholesaleUser(BasePermission):
    """Allows access only to approved wholesale users."""
    message = 'Your wholesale application is pending approval.'

    def has_permission(self, request, view):
        return (
            request.user is not None
            and isinstance(request.user, WholesaleUser)
            and request.user.is_active
            and request.user.status == ApplicationStatus.APPROVED
        )
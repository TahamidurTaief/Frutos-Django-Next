# users/password_reset_views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .models import PasswordResetOTP, User


@api_view(['POST'])
@permission_classes([AllowAny])
def send_password_reset_otp(request):
    """
    Send OTP for password reset to user's email.
    Endpoint: POST /api/auth/password-reset/send-otp/
    """
    email = request.data.get('email', '').lower().strip()
    
    if not email:
        return Response({
            'detail': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user exists
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal if email exists or not (security best practice)
        # But for demo, we can return success to allow testing
        return Response({
            'detail': 'If this email exists, we will send an OTP'
        }, status=status.HTTP_200_OK)
    
    # Create OTP
    otp_obj = PasswordResetOTP.create_otp(email)
    
    # In production, send OTP via email here
    # For now, just return success
    print(f"[Password Reset] OTP for {email}: {otp_obj.otp}")  # Debug logging
    
    return Response({
        'detail': 'OTP sent to your email',
        'email': email
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_password_reset_otp(request):
    """
    Verify OTP and reset password.
    Endpoint: POST /api/auth/password-reset/verify/
    Body: {
        "email": "user@example.com",
        "otp": "123456",
        "password": "newpassword123"
    }
    """
    email = request.data.get('email', '').lower().strip()
    otp = request.data.get('otp', '').strip()
    password = request.data.get('password', '')
    
    # Validate required fields
    if not email or not otp or not password:
        return Response({
            'detail': 'Email, OTP, and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password
    if len(password) < 8:
        return Response({
            'detail': 'Password must be at least 8 characters long'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not any(c.isalpha() for c in password) or not any(c.isdigit() for c in password):
        return Response({
            'detail': 'Password must contain letters and numbers'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Find OTP
    try:
        otp_obj = PasswordResetOTP.objects.get(email=email, otp=otp)
    except PasswordResetOTP.DoesNotExist:
        return Response({
            'detail': 'Invalid OTP'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if OTP is still valid
    if not otp_obj.is_valid():
        return Response({
            'detail': 'OTP has expired'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user exists
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({
            'detail': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Update password
    user.set_password(password)
    user.save()
    
    # Mark OTP as used
    otp_obj.is_used = True
    otp_obj.save()
    
    return Response({
        'detail': 'Password reset successful',
        'email': email
    }, status=status.HTTP_200_OK)

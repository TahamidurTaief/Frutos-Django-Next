from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import UserProfile, Address, Notification
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserReadSerializer,
    ProfileUpdateSerializer,
    AvatarUpdateSerializer,
    AddressSerializer,
    NotificationSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


# ─── Register ─────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    permission_classes = [permissions.AllowAny]
    serializer_class   = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        refresh['name']  = getattr(user, 'full_name', None) or getattr(user, 'name', None) or user.email
        refresh['email'] = user.email
        refresh['username'] = user.email
        refresh['avatar'] = ''

        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user':    UserReadSerializer(user, context={'request': request}).data,
        }, status=status.HTTP_201_CREATED)


# ─── Login ────────────────────────────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    """POST /api/auth/login/  — returns access + refresh + user object"""
    permission_classes = [permissions.AllowAny]
    serializer_class   = CustomTokenObtainPairSerializer


# ─── Logout ───────────────────────────────────────────────────────────────────

class LogoutView(APIView):
    """POST /api/auth/logout/  — blacklists refresh token"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


# ─── Profile — GET / PATCH ────────────────────────────────────────────────────

class ProfileView(APIView):
    """
    GET   /api/auth/profile/  — return current user's full profile
    PATCH /api/auth/profile/  — update name, phone, bio, notification prefs
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        serializer = UserReadSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.update(request.user, serializer.validated_data)

        #  DB থেকে fresh user fetch করো — cached stale profile বাদ দাও
        fresh_user = User.objects.select_related('profile').get(pk=request.user.pk)
        return Response(UserReadSerializer(fresh_user, context={'request': request}).data)


# ─── Avatar Upload ────────────────────────────────────────────────────────────

class AvatarUploadView(APIView):
    """POST /api/auth/avatar/  — multipart/form-data, field: avatar"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = AvatarUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'avatar': request.build_absolute_uri(profile.avatar.url) if profile.avatar else '',
        })


# ─── Change Password ──────────────────────────────────────────────────────────

class ChangePasswordView(APIView):
    """POST /api/auth/change-password/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password changed successfully.'})


# ─── Addresses ────────────────────────────────────────────────────────────────

class AddressListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/auth/addresses/  — list user's addresses
    POST /api/auth/addresses/  — add new address
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/auth/addresses/<id>/
    PATCH  /api/auth/addresses/<id>/
    DELETE /api/auth/addresses/<id>/
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


# ─── Order History ────────────────────────────────────────────────────────────

class UserOrderHistoryView(generics.ListAPIView):
    """GET /api/auth/orders/  — current user's orders, newest first"""
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        from orders.models import Order
        from orders.serializers import OrderReadSerializer

        orders = (
            Order.objects
            .filter(user=request.user)
            .prefetch_related('items__product')
            .order_by('-created_at')
        )
        serializer = OrderReadSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)


# ─── Notifications — list ─────────────────────────────────────────────────────

class NotificationListView(generics.ListAPIView):
    """GET /api/auth/notifications/?unread=true"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = NotificationSerializer

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user)
        if self.request.query_params.get('unread') == 'true':
            qs = qs.filter(is_read=False)
        return qs[:50]  # latest 50


# ─── Notification — delete single ────────────────────────────────────────────

class NotificationDeleteView(APIView):
    """DELETE /api/auth/notifications/<id>/  — delete a single notification"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, user=request.user)
            notif.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Notification.DoesNotExist:
            return Response(
                {'detail': 'Notification not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )


# ─── Notifications — mark read ────────────────────────────────────────────────

class NotificationMarkReadView(APIView):
    """POST /api/auth/notifications/mark-read/  body: {ids: [1,2,3]} or {all: true}"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.data.get('all'):
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        else:
            ids = request.data.get('ids', [])
            Notification.objects.filter(user=request.user, id__in=ids).update(is_read=True)
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unreadCount': unread_count})


# ─── Notifications — unread count ────────────────────────────────────────────

class UnreadCountView(APIView):
    """GET /api/auth/notifications/unread-count/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unreadCount': count})
    


import random
from django.core.mail import send_mail
from django.conf import settings
from .models import PasswordResetOTP

class SendPasswordResetOTPView(APIView):
    """POST /api/auth/password-reset/send-otp/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # User exists check
        if not User.objects.filter(email__iexact=email).exists():
            # Security: same response even if not found
            return Response({'detail': 'If this email exists, an OTP has been sent.'})

        otp = str(random.randint(100000, 999999))
        PasswordResetOTP.objects.filter(email=email).delete()  # old OTPs clear
        PasswordResetOTP.objects.create(email=email, otp=otp)

        send_mail(
            subject='El Árbol — Password Reset OTP',
            message=f'Your OTP is: {otp}\n\nValid for 10 minutes. Do not share this with anyone.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({'detail': 'OTP sent successfully.'})


class VerifyOTPAndResetPasswordView(APIView):
    """POST /api/auth/password-reset/verify/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email    = request.data.get('email', '').strip().lower()
        otp      = request.data.get('otp', '').strip()
        password = request.data.get('password', '')

        if not all([email, otp, password]):
            return Response({'detail': 'Email, OTP, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({'detail': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            record = PasswordResetOTP.objects.filter(email=email, otp=otp, is_used=False).latest('created_at')
        except PasswordResetOTP.DoesNotExist:
            return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        if not record.is_valid():
            return Response({'detail': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
            user.set_password(password)
            user.save()
            record.is_used = True
            record.save()
            return Response({'detail': 'Password reset successful.'})
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)





# for dashboard API endpoints, see dashboard/api_views.py
from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

User = get_user_model()

class AdminUserListView(APIView):
    """
    GET  /api/auth/admin/users/   — সব user list (normal + wholesale)
    POST /api/auth/admin/users/   — নতুন user create
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # শুধু ADMIN/SELLER/VENDOR access পাবে
        if not request.user.user_type in ['ADMIN', 'SELLER']:
            return Response({'detail': 'Forbidden'}, status=403)

        search    = request.GET.get('search', '')
        page      = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))

        qs = User.objects.select_related('profile').order_by('-date_joined')

        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(email__icontains=search) |
                Q(name__icontains=search)
            )

        total = qs.count()
        start = (page - 1) * page_size
        users = qs[start:start + page_size]

        data = []
        for u in users:
            # Wholesale user কিনা check করো
            is_wholesale = hasattr(u, 'wholesale_profile')
            data.append({
                'id':          u.id,
                'name':        getattr(u, 'name', '') or u.email,
                'email':       u.email,
                'user_type':   getattr(u, 'user_type', 'CUSTOMER'),
                'is_active':   u.is_active,
                'date_joined': u.date_joined,
                'phone':       getattr(u.profile, 'phone', '') if hasattr(u, 'profile') else '',
                'is_wholesale': is_wholesale,
                # Wholesale specific data
                'wholesale_status': getattr(
                    getattr(u, 'wholesale_profile', None), 'status', None
                ),
                'business_name': getattr(
                    getattr(u, 'wholesale_profile', None), 'business_name', None
                ),
            })

        return Response({
            'count':   total,
            'results': data,
        })

    def post(self, request):
        if request.user.user_type not in ['ADMIN']:
            return Response({'detail': 'Forbidden'}, status=403)

        email     = request.data.get('email', '').strip().lower()
        name      = request.data.get('name', '').strip()
        password  = request.data.get('password', '')
        user_type = request.data.get('user_type', 'CUSTOMER')

        if not email or not password:
            return Response({'detail': 'Email and password required.'}, status=400)

        if User.objects.filter(email__iexact=email).exists():
            return Response({'detail': 'Email already exists.'}, status=400)

        user = User.objects.create_user(
            email=email,
            password=password,
            name=name,
        )
        if hasattr(user, 'user_type'):
            user.user_type = user_type
            user.save()

        return Response({
            'id':        user.id,
            'email':     user.email,
            'name':      getattr(user, 'name', ''),
            'user_type': getattr(user, 'user_type', 'CUSTOMER'),
            'is_active': user.is_active,
        }, status=201)


class AdminUserDetailView(APIView):
    """
    PATCH  /api/auth/admin/users/<id>/
    DELETE /api/auth/admin/users/<id>/
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if request.user.user_type not in ['ADMIN']:
            return Response({'detail': 'Forbidden'}, status=403)
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        if 'name' in request.data:
            user.name = request.data['name']
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
        if 'user_type' in request.data:
            user.user_type = request.data['user_type']
        user.save()

        return Response({'detail': 'Updated successfully.'})

    def delete(self, request, pk):
        if request.user.user_type not in ['ADMIN']:
            return Response({'detail': 'Forbidden'}, status=403)
        try:
            user = User.objects.get(pk=pk)
            user.delete()
            return Response(status=204)
        except User.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)
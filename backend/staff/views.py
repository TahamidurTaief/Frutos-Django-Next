from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db import models
from .models import StaffProfile, StaffShift, StaffTask, StaffNotification, Announcement, DayOffRequest
from .serializers import (
    StaffProfileSerializer, CreateStaffSerializer, StaffShiftSerializer, 
    StaffTaskSerializer, StaffNotificationSerializer, DayOffRequestSerializer,
    AnnouncementSerializer, AnnouncementCreateSerializer, StoreStaffTreeSerializer
)
from stores.models import Store
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import logging
logger = logging.getLogger(__name__)

# Custom Permission
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
            
        user_type = getattr(user, 'user_type', '')
        if user_type:
            user_type = str(user_type).upper()
            
        has_perm = bool(user_type == 'ADMIN' or user.is_superuser or (user.is_staff and user_type != 'STAFF'))
        logger.error(f"IsAdminUser check: user={user}, is_auth={user.is_authenticated}, type={user_type}, is_superuser={getattr(user, 'is_superuser', False)}, is_staff={getattr(user, 'is_staff', False)}, has_perm={has_perm}")
        return has_perm

class IsStaffUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'user_type', '') == 'STAFF')

# ==========================================
# ADMIN APIs
# ==========================================

class AdminStaffViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = StaffProfileSerializer

    def get_queryset(self):
        queryset = StaffProfile.objects.all().order_by('-created_at')
        store_id = self.request.query_params.get('store_id')
        if store_id:
            queryset = queryset.filter(store_id=store_id)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = CreateStaffSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff_profile = serializer.save()
        return Response(StaffProfileSerializer(staff_profile).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Update User fields if provided
        user = instance.user
        user_changed = False
        
        if 'name' in request.data:
            user.name = request.data['name']
            user_changed = True
        if 'email' in request.data:
            user.email = request.data['email']
            user_changed = True
        if 'password' in request.data and request.data['password']:
            new_password = request.data['password']
            user.set_password(new_password)
            user_changed = True
            
            instance.secret_key = new_password
            instance.save()
            
        if user_changed:
            user.save()
            
        # Update StaffProfile fields
        return super().update(request, *args, **kwargs)

class AdminStaffShiftViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    queryset = StaffShift.objects.all().order_by('-date', '-start_time')
    serializer_class = StaffShiftSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        staff_id = self.request.query_params.get('staff_id')
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
        return queryset

class AdminStaffTaskViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    queryset = StaffTask.objects.all().order_by('-created_at')
    serializer_class = StaffTaskSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        staff_id = self.request.query_params.get('staff_id')
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
        return queryset

# ==========================================
# STAFF APIs
# ==========================================

class MyStaffDashboardView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        staff_profile = get_object_or_404(StaffProfile, user=request.user)
        
        # Get today's shifts (or upcoming week)
        shifts = StaffShift.objects.filter(staff=staff_profile).order_by('date')[:7]
        
        # Get tasks
        tasks = StaffTask.objects.filter(staff=staff_profile).order_by('-created_at')[:10]
        
        # Get notifications
        notifications = StaffNotification.objects.filter(staff=staff_profile).order_by('-created_at')[:5]

        return Response({
            'profile': StaffProfileSerializer(staff_profile, context={'request': request}).data,
            'shifts': StaffShiftSerializer(shifts, many=True, context={'request': request}).data,
            'tasks': StaffTaskSerializer(tasks, many=True, context={'request': request}).data,
            'notifications': StaffNotificationSerializer(notifications, many=True, context={'request': request}).data
        })

class MyStaffTasksView(generics.ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = StaffTaskSerializer

    def get_queryset(self):
        return StaffTask.objects.filter(staff__user=self.request.user).order_by('-created_at')

class MyStaffTaskUpdateView(generics.UpdateAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = StaffTaskSerializer
    
    def get_queryset(self):
        return StaffTask.objects.filter(staff__user=self.request.user)

class MyStaffNotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = StaffNotificationSerializer
    
    def get_queryset(self):
        return StaffNotification.objects.filter(staff__user=self.request.user)

class MyStaffDayOffRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffUser]
    serializer_class = DayOffRequestSerializer

    def get_queryset(self):
        return DayOffRequest.objects.filter(staff__user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(staff=self.request.user.staff_profile, status='PENDING')

# ==========================================
# SHARED APIs (Announcements)
# ==========================================

class AnnouncementViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'targets']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return AnnouncementCreateSerializer
        return AnnouncementSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Announcement.objects.none()
            
        user_type = getattr(user, 'user_type', '')
        if user_type == 'ADMIN' or getattr(user, 'is_superuser', False):
            return Announcement.objects.all().order_by('-created_at')
            
        # For staff, return targeted announcements
        try:
            staff_profile = user.staff_profile
            return Announcement.objects.filter(
                models.Q(target_all_stores=True) |
                models.Q(target_stores=staff_profile.store) |
                models.Q(target_staff=staff_profile)
            ).distinct().order_by('-created_at')
        except StaffProfile.DoesNotExist:
            return Announcement.objects.none()

    def perform_create(self, serializer):
        announcement = serializer.save(created_by=self.request.user)
        
        # Create StaffNotification records
        target_staff_set = set()
        if announcement.target_all_stores:
            for staff in StaffProfile.objects.all():
                target_staff_set.add(staff)
        else:
            for store in announcement.target_stores.all():
                for staff in store.staff.all():
                    target_staff_set.add(staff)
            for staff in announcement.target_staff.all():
                target_staff_set.add(staff)
                
        notifications = []
        for staff in target_staff_set:
            notifications.append(StaffNotification(
                staff=staff,
                title=f"Announcement: {announcement.title}",
                message=announcement.message
            ))
        if notifications:
            StaffNotification.objects.bulk_create(notifications)

        # Broadcast notification via Django Channels
        channel_layer = get_channel_layer()
        message_data = {
            'type': 'send_announcement',
            'announcement': AnnouncementSerializer(announcement).data
        }
        
        if announcement.target_all_stores:
            async_to_sync(channel_layer.group_send)('staff_all', message_data)
        else:
            for store in announcement.target_stores.all():
                async_to_sync(channel_layer.group_send)(f'store_{store.id}', message_data)
            
            for staff in announcement.target_staff.all():
                async_to_sync(channel_layer.group_send)(f'user_{staff.user.id}', message_data)

    @action(detail=False, methods=['get'])
    def targets(self, request):
        stores = Store.objects.filter(is_active=True).prefetch_related('staff', 'staff__user')
        serializer = StoreStaffTreeSerializer(stores, many=True)
        return Response(serializer.data)

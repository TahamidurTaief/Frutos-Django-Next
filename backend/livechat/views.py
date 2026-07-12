from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Max, Count
from django.contrib.auth import get_user_model
from .models import ChatMessage

User = get_user_model()

class LiveChatUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Get users who have exchanged messages with the current user
        messages = ChatMessage.objects.filter(
            Q(sender=user) | Q(receiver=user)
        )
        
        user_ids = set(messages.values_list('sender_id', flat=True)) | set(messages.values_list('receiver_id', flat=True))
        if user.id in user_ids:
            user_ids.remove(user.id)
            
        # If the user is a STAFF, ensure ADMIN is in the list even if no messages yet
        if user.user_type == 'STAFF' or getattr(user, 'is_staff', False) and not getattr(user, 'is_superuser', False):
            # Find the primary admin
            admin = User.objects.filter(user_type='ADMIN').first()
            if admin and admin.id not in user_ids:
                user_ids.add(admin.id)
            
        # If the user is an ADMIN, ensure ALL STAFF are in the list
        if user.user_type == 'ADMIN' or getattr(user, 'is_superuser', False):
            staff_users = User.objects.filter(Q(user_type='STAFF') | Q(is_staff=True)).exclude(id=user.id).exclude(user_type='ADMIN').values_list('id', flat=True)
            user_ids.update(staff_users)
                
        users = User.objects.filter(id__in=user_ids)
        
        data = []
        for u in users:
            # Get last message
            last_message = ChatMessage.objects.filter(
                (Q(sender=user, receiver=u) | Q(sender=u, receiver=user))
            ).order_by('-created_at').first()
            
            # Get unread count
            unread_count = ChatMessage.objects.filter(
                sender=u, receiver=user, is_read=False
            ).count()
            
            # Get store/shop info if it's a staff
            store_name = None
            photo = None
            is_active = u.is_active
            
            if hasattr(u, 'staff_profile') and u.staff_profile:
                if u.staff_profile.photo:
                    photo = u.staff_profile.photo.url
                    
                from datetime import date
                active_shift = u.staff_profile.shifts.filter(date=date.today(), status='IN_PROGRESS').first()
                if active_shift:
                    is_active = True
                    store_name = active_shift.store.name if active_shift.store else None
                else:
                    is_active = False
                    
            if not photo and hasattr(u, 'profile') and u.profile and u.profile.avatar:
                photo = u.profile.avatar.url
                
            if not photo and getattr(u, 'profile_image', None):
                photo = u.profile_image.url
            
            data.append({
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'user_type': u.user_type,
                'store_name': store_name,
                'photo': photo,
                'is_active': is_active,
                'last_message': last_message.text if last_message else None,
                'last_message_time': last_message.created_at if last_message else None,
                'unread_count': unread_count
            })
            
        # Sort by last message time
        data.sort(key=lambda x: x['last_message_time'].isoformat() if x['last_message_time'] else "", reverse=True)
        return Response(data)

class LiveChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = request.user
        
        # Mark messages as read
        ChatMessage.objects.filter(
            sender_id=user_id,
            receiver=user,
            is_read=False
        ).update(is_read=True)
        
        messages = ChatMessage.objects.filter(
            Q(sender=user, receiver_id=user_id) | Q(sender_id=user_id, receiver=user)
        ).order_by('created_at')
        
        data = []
        for msg in messages:
            data.append({
                'id': msg.id,
                'sender_id': msg.sender_id,
                'receiver_id': msg.receiver_id,
                'text': msg.text,
                'created_at': msg.created_at,
                'is_read': msg.is_read
            })
            
        return Response(data)

    def delete(self, request, user_id):
        user = request.user
        ChatMessage.objects.filter(
            Q(sender=user, receiver_id=user_id) | Q(sender_id=user_id, receiver=user)
        ).delete()
        return Response({"detail": "Chat history deleted."})

class AdminChatConversationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if getattr(user, 'user_type', None) != 'ADMIN' and not getattr(user, 'is_superuser', False):
            return Response({"detail": "Not authorized."}, status=403)
            
        messages = ChatMessage.objects.select_related('sender', 'receiver').order_by('-created_at')
        
        conversations_dict = {}
        
        def get_photo_url(u):
            if not u: return None
            photo = None
            if hasattr(u, 'staff_profile') and u.staff_profile and u.staff_profile.photo:
                photo = u.staff_profile.photo.url
            elif hasattr(u, 'profile') and u.profile and getattr(u.profile, 'avatar', None):
                photo = u.profile.avatar.url
            elif getattr(u, 'profile_image', None):
                photo = u.profile_image.url
            return request.build_absolute_uri(photo) if photo else None
        
        for msg in messages:
            pair_key = tuple(sorted([msg.sender_id, msg.receiver_id]))
            
            if pair_key not in conversations_dict:
                user1 = msg.sender
                user2 = msg.receiver
                
                conversations_dict[pair_key] = {
                    'id': f"{pair_key[0]}_{pair_key[1]}",
                    'user1_id': user1.id if user1 else None,
                    'user1_name': user1.name if user1 else 'Unknown',
                    'user1_email': user1.email if user1 else 'Unknown',
                    'user1_image': get_photo_url(user1),
                    'user2_id': user2.id if user2 else None,
                    'user2_name': user2.name if user2 else 'Unknown',
                    'user2_email': user2.email if user2 else 'Unknown',
                    'user2_image': get_photo_url(user2),
                    'last_message': msg.text,
                    'last_message_time': msg.created_at,
                    'total_messages': 0
                }
            conversations_dict[pair_key]['total_messages'] += 1
            
        result = list(conversations_dict.values())
        return Response(result)

class AdminChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if getattr(user, 'user_type', None) != 'ADMIN' and not getattr(user, 'is_superuser', False):
            return Response({"detail": "Not authorized."}, status=403)
            
        user1_id = request.query_params.get('user1_id')
        user2_id = request.query_params.get('user2_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        messages = ChatMessage.objects.select_related('sender', 'receiver').all()
        
        if user1_id and user2_id:
            messages = messages.filter(
                Q(sender_id=user1_id, receiver_id=user2_id) | Q(sender_id=user2_id, receiver_id=user1_id)
            )
            
        if start_date:
            messages = messages.filter(created_at__date__gte=start_date)
        if end_date:
            messages = messages.filter(created_at__date__lte=end_date)
            
        messages = messages.order_by('-created_at') # Order by newest first
        
        data = []
        for msg in messages:
            data.append({
                'id': msg.id,
                'sender_id': msg.sender_id,
                'sender_name': msg.sender.name if msg.sender else 'Unknown',
                'receiver_id': msg.receiver_id,
                'receiver_name': msg.receiver.name if msg.receiver else 'Unknown',
                'text': msg.text,
                'created_at': msg.created_at,
                'is_read': msg.is_read
            })
            
        return Response(data)

    def delete(self, request):
        user = request.user
        if getattr(user, 'user_type', None) != 'ADMIN' and not getattr(user, 'is_superuser', False):
            return Response({"detail": "Not authorized."}, status=403)
            
        user1_id = request.query_params.get('user1_id')
        user2_id = request.query_params.get('user2_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        messages = ChatMessage.objects.all()
        
        if user1_id and user2_id:
            messages = messages.filter(
                Q(sender_id=user1_id, receiver_id=user2_id) | Q(sender_id=user2_id, receiver_id=user1_id)
            )
            
        if start_date:
            messages = messages.filter(created_at__date__gte=start_date)
        if end_date:
            messages = messages.filter(created_at__date__lte=end_date)
            
        if not user1_id and not user2_id and not start_date and not end_date:
            return Response({"detail": "Must provide filters (user1, user2, start_date, or end_date) to delete."}, status=400)
            
        deleted_count, _ = messages.delete()
        return Response({"detail": f"Deleted {deleted_count} messages successfully."})

from django.utils import timezone
from django.db.models import Count, Sum
from .models import AdminDetails
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from booking.models import *
from user_roles.serializers import CustomUserSerializer
from user_roles.models import CustomUsers

# Create your views here.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_details(request):
    try:
        admin_details = AdminDetails.objects.get(email="admin@gmail.com")
    except AdminDetails.DoesNotExist:
        return Response({"error": "Admin not found"}, status=status.HTTP_404_NOT_FOUND)
    
    data = {
        "name": admin_details.name,
        "email": admin_details.email,
        "profile_pic": admin_details.profile_pic.url if admin_details.profile_pic else None
    }
    
    return Response({
        'data': data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    now = timezone.now()
    
    try:
        active_bookings = Bookings.objects.filter(status__in=['confirmed', 'checked_in']).count()
        available_rooms = Rooms.objects.filter(status='available').count()
        occupied_rooms = Rooms.objects.filter(status='occupied').count()
        maintenance_rooms = Rooms.objects.filter(status='maintenance').count()
        upcoming_reservations = Reservations.objects.filter(start_time__gte=now).count()
        revenue = Transactions.objects.filter(status='completed').aggregate(total=Sum('amount'))['total']
        
        if revenue is None:
            revenue = 0.0
        
        return Response({
            "active_bookings": active_bookings,
            "available_rooms": available_rooms,
            "occupied_rooms": occupied_rooms,
            "maintenance_rooms": maintenance_rooms,
            "upcoming_reservations": upcoming_reservations,
            "revenue": float(revenue)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def area_reservations(request):
    try:
        data = Reservations.objects.values('area').annotate(count=Count('area'))
        
        return Response({
            "data": data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manage_users(request):
    try:
        users = CustomUsers.objects.filter(is_admin=False)
        serializer = CustomUserSerializer(users, many=True)
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
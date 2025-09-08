# core/tailorviews.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Order, TailorProfile
from .serializers import OrderSerializer

class TailorOrderListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        try:
            tailor_profile = TailorProfile.objects.get(user=self.request.user)
            return Order.objects.filter(school__in=tailor_profile.schools.all())
        except TailorProfile.DoesNotExist:
            return Order.objects.none()

class TailorOrderUpdateView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        try:
            tailor_profile = TailorProfile.objects.get(user=self.request.user)
            
            # Check if the tailor is assigned to this school
            if instance.school not in tailor_profile.schools.all():
                return Response(
                    {"error": "You are not assigned to this school."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            return Response(serializer.data)
        except TailorProfile.DoesNotExist:
            return Response(
                {"error": "You are not registered as a tailor."},
                status=status.HTTP_403_FORBIDDEN
            )
# core/deliveryviews.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Shipment, DeliveryPartnerProfile
from .serializers import ShipmentSerializer

class DeliveryShipmentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ShipmentSerializer
    
    def get_queryset(self):
        try:
            delivery_profile = DeliveryPartnerProfile.objects.get(user=self.request.user)
            return Shipment.objects.filter(delivery_partner=self.request.user)
        except DeliveryPartnerProfile.DoesNotExist:
            return Shipment.objects.none()

class DeliveryShipmentUpdateView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        try:
            delivery_profile = DeliveryPartnerProfile.objects.get(user=self.request.user)
            
            # Check if the delivery partner is assigned to this shipment
            if instance.delivery_partner != self.request.user:
                return Response(
                    {"error": "You are not assigned to this shipment."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            return Response(serializer.data)
        except DeliveryPartnerProfile.DoesNotExist:
            return Response(
                {"error": "You are not registered as a delivery partner."},
                status=status.HTTP_403_FORBIDDEN
            )
# core/paymentviews.py
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Payment, Order
from .serializers import PaymentSerializer

class PaymentInitiateView(generics.CreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    
    def create(self, request, *args, **kwargs):
        order_id = request.data.get('order')
        
        try:
            order = Order.objects.get(id=order_id, order_code=request.data.get('order_code'))
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Process payment (this would integrate with your payment gateway)
        # For now, we'll just create a payment record
        
        payment_data = {
            'order': order.id,
            'amount': order.total_amount,
            'method': request.data.get('method', 'card'),
            'status': 'completed'  # Assuming successful for demo
        }
        
        serializer = self.get_serializer(data=payment_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Update order status
        order.status = 'confirmed'
        order.save()
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class PaymentWebhookView(generics.CreateAPIView):
    # This would handle payment gateway webhooks
    permission_classes = []  # No authentication for webhooks
    
    def create(self, request, *args, **kwargs):
        # Process webhook data from payment gateway
        # This is a placeholder implementation
        return Response({"status": "webhook received"}, status=status.HTTP_200_OK)
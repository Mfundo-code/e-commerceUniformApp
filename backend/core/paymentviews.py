# core/paymentviews.py
import paypalrestsdk
from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment, Order
from .serializers import PaymentSerializer

# Configure PayPal SDK
paypalrestsdk.configure({
    "mode": settings.PAYPAL_MODE,
    "client_id": settings.PAYPAL_CLIENT_ID,
    "client_secret": settings.PAYPAL_CLIENT_SECRET
})

class PaymentInitiateView(APIView):
    def post(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        order_code = request.data.get('order_code')
        
        try:
            order = Order.objects.get(id=order_id, order_code=order_code)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create PayPal payment
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": f"{settings.FRONTEND_URL}/payment/success/",
                "cancel_url": f"{settings.FRONTEND_URL}/payment/cancel/"
            },
            "transactions": [{
                "amount": {
                    "total": str(order.total_amount),
                    "currency": "USD"
                },
                "description": f"Payment for order {order.order_code}"
            }]
        })
        
        if payment.create():
            # Store payment in database
            payment_record = Payment.objects.create(
                order=order,
                amount=order.total_amount,
                method="paypal",
                status="pending",
                transaction_id=payment.id
            )
            
            # Find approval URL
            for link in payment.links:
                if link.rel == "approval_url":
                    approval_url = link.href
                    return Response({
                        "payment_id": payment.id,
                        "approval_url": approval_url
                    }, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Failed to create PayPal payment."},
            status=status.HTTP_400_BAD_REQUEST
        )

class PaymentExecuteView(APIView):
    def post(self, request, *args, **kwargs):
        payment_id = request.data.get('paymentID')
        payer_id = request.data.get('payerID')
        
        try:
            payment = paypalrestsdk.Payment.find(payment_id)
            
            if payment.execute({"payer_id": payer_id}):
                # Update payment status in database
                payment_record = Payment.objects.get(transaction_id=payment_id)
                payment_record.status = "completed"
                payment_record.save()
                
                # Update order status
                order = payment_record.order
                order.status = "confirmed"
                order.save()
                
                return Response({
                    "status": "Payment completed successfully.",
                    "order_code": order.order_code
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Payment execution failed."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Payment.DoesNotExist:
            return Response(
                {"error": "Payment record not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PaymentStatusView(APIView):
    def get(self, request, *args, **kwargs):
        payment_id = request.GET.get('payment_id')
        
        try:
            payment = Payment.objects.get(transaction_id=payment_id)
            return Response({
                "status": payment.status,
                "order_code": payment.order.order_code if payment.order else None
            }, status=status.HTTP_200_OK)
            
        except Payment.DoesNotExist:
            return Response(
                {"error": "Payment not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class PaymentWebhookView(APIView):
    # This would handle payment gateway webhooks
    permission_classes = []  # No authentication for webhooks
    
    def post(self, request, *args, **kwargs):
        # Process webhook data from PayPal
        # This is a placeholder implementation
        return Response({"status": "webhook received"}, status=status.HTTP_200_OK)
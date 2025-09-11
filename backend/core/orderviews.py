from rest_framework import generics, status
from rest_framework.response import Response
import random
import string
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import (
    Order,
    School,
    TailorProfile,
    Cart,
    CartItem,
    OrderLine,  
    Payment      
)

from .serializers import OrderCreateSerializer, OrderSerializer
import paypalrestsdk

# Configure PayPal SDK
paypalrestsdk.configure({
    "mode": settings.PAYPAL_MODE,
    "client_id": settings.PAYPAL_CLIENT_ID,
    "client_secret": settings.PAYPAL_CLIENT_SECRET
})

class GuestCheckoutView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderCreateSerializer
    permission_classes = []  # Allow anyone to create orders
    
    def create(self, request, *args, **kwargs):
        # Get the cart
        session_key = request.session.session_key
        try:
            cart = Cart.objects.get(session_key=session_key)
        except Cart.DoesNotExist:
            return Response(
                {"error": "Cart not found. Please add items to your cart first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if cart.items.count() == 0:
            return Response(
                {"error": "Your cart is empty. Please add items to your cart first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate unique order code
        order_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        request.data['order_code'] = order_code
        
        # Calculate total from cart
        request.data['total_amount'] = cart.get_total()
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        # Move cart items to order lines
        for cart_item in cart.items.all():
            OrderLine.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price,
                measurements=cart_item.measurements,
                # Add student information to order line
                student_name=cart_item.student_name,
                student_age=cart_item.student_age,
                student_grade=cart_item.student_grade,
                student_gender=cart_item.student_gender,
                student_height=cart_item.student_height
            )
        
        # Clear the cart
        cart.items.all().delete()
        cart.delete()
        
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
                "description": f"Payment for order {order.order_code}",
                "custom": str(order.id)  # Store order ID in custom field
            }]
        })
        
        if payment.create():
            # Find approval URL
            for link in payment.links:
                if link.rel == "approval_url":
                    approval_url = link.href
                    
                    # Return payment information instead of assigning tailor immediately
                    response_data = {
                        "order_id": order.id,
                        "order_code": order.order_code,
                        "total_amount": str(order.total_amount),
                        "payment_id": payment.id,
                        "approval_url": approval_url,
                        "message": "Order created successfully. Please complete payment."
                    }
                    
                    headers = self.get_success_headers(serializer.data)
                    return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
        
        # If payment creation fails
        return Response(
            {"error": "Failed to create payment. Please try again."},
            status=status.HTTP_400_BAD_REQUEST
        )

class PaymentSuccessView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def update(self, request, *args, **kwargs):
        payment_id = request.data.get('paymentID')
        payer_id = request.data.get('payerID')
        order_id = request.data.get('orderID')
        
        try:
            # Find the payment
            payment = paypalrestsdk.Payment.find(payment_id)
            
            # Execute payment
            if payment.execute({"payer_id": payer_id}):
                # Get the order
                order = Order.objects.get(id=order_id)
                
                # Update order status
                order.status = 'confirmed'
                order.save()
                
                # Create payment record
                from .models import Payment
                Payment.objects.create(
                    order=order,
                    amount=order.total_amount,
                    method='paypal',
                    transaction_id=payment_id,
                    status='completed'
                )
                
                # Assign order to tailor and send notifications
                self.assign_order_to_tailor(order)
                self.send_customer_confirmation(order)
                
                return Response({
                    "status": "Payment completed successfully.",
                    "order_code": order.order_code,
                    "message": "Order confirmed and assigned to a tailor."
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Payment execution failed."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def assign_order_to_tailor(self, order):
        """Find the closest tailor and assign the order to them"""
        # Get the school's location
        school = order.school
        
        # Find tailors who serve this school and are approved
        tailors = TailorProfile.objects.filter(
            schools=school,
            is_approved=True,
            is_email_verified=True
        )
        
        if tailors.exists():
            # In a real implementation, you would use geolocation to find the closest one
            tailor = tailors.first()
            
          
            confirmation_token = order.generate_confirmation_token()
            
            order.set_deadline()
            
     
            self.send_tailor_notification(order, tailor, confirmation_token)
            
           
            order.tailor = tailor.user
            order.assigned_at = timezone.now()
            order.save()
            
        else:
            
            pass
    
    def send_tailor_notification(self, order, tailor, confirmation_token):
        """Send email notification to tailor about new order"""
        subject = f'New Order Assignment - {order.order_code}'
        
        # Create confirmation URL
        confirmation_url = f"{settings.FRONTEND_URL}/tailor/confirm-order/{confirmation_token}/"
        
        message = f'''
        Hello {tailor.user.first_name} {tailor.user.last_name},
        
        You have been assigned a new school uniform order.
        
        Order Details:
        - Order Code: {order.order_code}
        - School: {order.school.name}
        - Student: {order.student_name}
        - Deadline: {order.deadline.strftime('%Y-%m-%d')}
        
        Please confirm that you will work on this order by clicking the link below:
        {confirmation_url}
        
        You have 7 days to complete this order.
        
        Best regards,
        The School Uniforms Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [tailor.user.email],
            fail_silently=False,
        )
    
    def send_customer_confirmation(self, order):
        """Send confirmation email to customer"""
        subject = f'Order Confirmation - {order.order_code}'
        
        message = f'''
        Hello {order.customer_name},
        
        Thank you for your order. Your payment has been received and your order is being processed.
        
        Order Details:
        - Order Code: {order.order_code}
        - School: {order.school.name}
        - Student: {order.student_name}
        - Total Amount: ${order.total_amount}
        
        We will notify you once your order is ready for delivery.
        
        Best regards,
        The School Uniforms Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [order.customer_email],
            fail_silently=False,
        )

class PaymentCancelView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def update(self, request, *args, **kwargs):
        order_id = request.data.get('orderID')
        
        try:
            order = Order.objects.get(id=order_id)
            order.status = 'cancelled'
            order.save()
            
            return Response({
                "message": "Payment cancelled. Order has been cancelled."
            }, status=status.HTTP_200_OK)
            
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class OrderLookupView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    lookup_field = 'order_code'
    permission_classes = []  # Allow anyone to lookup orders

class TailorOrderConfirmationView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    lookup_field = 'confirmation_token'
    
    def update(self, request, *args, **kwargs):
        order = self.get_object()
        
        # Check if the order is already confirmed
        if order.status != 'confirmed':
            return Response(
                {"error": "This order has already been confirmed or is not in the correct state."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the confirmation token is valid
        if order.confirmation_token != kwargs.get('confirmation_token'):
            return Response(
                {"error": "Invalid confirmation token."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order status to in_production
        order.status = 'in_production'
        order.confirmation_token = None  # Clear the token after confirmation
        order.save()
        
        # Send confirmation email to customer
        self.send_confirmation_email(order)
        
        return Response({
            "message": "Order confirmed successfully. You can now start working on it.",
            "deadline": order.deadline
        })
    
    def send_confirmation_email(self, order):
        """Send email to customer that tailor has accepted the order"""
        subject = f'Order Update - {order.order_code}'
        
        message = f'''
        Hello {order.customer_name},
        
        Good news! Your order has been accepted by our tailor and is now in production.
        
        Order Details:
        - Order Code: {order.order_code}
        - School: {order.school.name}
        - Student: {order.student_name}
        - Expected Completion: {order.deadline.strftime('%Y-%m-%d')}
        
        We will notify you once your order is ready for delivery.
        
        Best regards,
        The School Uniforms Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [order.customer_email],
            fail_silently=False,
        )
# core/orderviews.py
from rest_framework import generics, status
from rest_framework.response import Response
import random
import string
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import Order, School, TailorProfile
from .serializers import OrderCreateSerializer, OrderSerializer

class GuestCheckoutView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderCreateSerializer
    permission_classes = []  # Allow anyone to create orders
    
    def create(self, request, *args, **kwargs):
        # Generate unique order code
        order_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        request.data['order_code'] = order_code
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        # Assign order to closest tailor and send email
        self.assign_order_to_tailor(order)
        
        # Send confirmation email to customer
        self.send_customer_confirmation(order)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
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
            # For simplicity, we'll just take the first tailor
            # In a real implementation, you would use geolocation to find the closest one
            tailor = tailors.first()
            
            # Generate confirmation token
            confirmation_token = order.generate_confirmation_token()
            
            # Set deadline (7 days from now)
            order.set_deadline()
            
            # Send email to tailor
            self.send_tailor_notification(order, tailor, confirmation_token)
            
            # Update order with assigned tailor
            order.tailor = tailor.user
            order.assigned_at = timezone.now()
            order.save()
            
        else:
            # If no tailor is found, you might want to notify admin
            # or handle this case differently
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
        
        Thank you for your order. Your order has been received and is being processed.
        
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
        if order.status != 'pending':
            return Response(
                {"error": "This order has already been confirmed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the confirmation token is valid
        if order.confirmation_token != kwargs.get('confirmation_token'):
            return Response(
                {"error": "Invalid confirmation token."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order status to confirmed
        order.status = 'confirmed'
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
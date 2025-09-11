# core/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import random
import string
import json

class School(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    town = models.CharField(max_length=100, null=True, blank=True)
    province = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    GARMENT_TYPES = (
        ('shirt_blouse', 'Shirt/Blouse (formal)'),
        ('polo_tshirt', 'Polo/T-shirt'),
        ('trousers_pants', 'Trousers/Pants'),
        ('skirt', 'Skirt'),
        ('shorts', 'Shorts'),
        ('pinafore', 'Pinafore/Overall/Tunic/Dress'),
        ('blazer', 'Blazer/Jacket/Cardigan'),
        ('pe_kit', 'PE Kit'),
        ('accessory', 'Accessory (Tie/Belt)'),
    )
    
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='products')
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    garment_type = models.CharField(max_length=20, choices=GARMENT_TYPES, null=True, blank=True)
    available_sizes = models.JSONField(help_text="Standard sizes available (S, M, L, XL, etc.)", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.school.name} - {self.get_garment_type_display()}"

class Order(models.Model):
    ORDER_STATUS = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_production', 'In Production'),
        ('completed', 'Completed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    
    order_code = models.CharField(max_length=10, unique=True, null=True, blank=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, null=True, blank=True)
    customer_name = models.CharField(max_length=255, null=True, blank=True)
    customer_phone = models.CharField(max_length=15, null=True, blank=True)
    customer_email = models.EmailField(blank=True, null=True)
    
    # Student information - made all fields nullable
    student_name = models.CharField(max_length=255, null=True, blank=True)
    student_age = models.PositiveIntegerField(help_text="Age in years", null=True, blank=True)
    student_grade = models.CharField(max_length=50, help_text="Grade/Class", null=True, blank=True)
    student_gender = models.CharField(max_length=10, choices=(('male', 'Male'), ('female', 'Female'), ('other', 'Other')), null=True, blank=True)
    student_height = models.DecimalField(max_digits=5, decimal_places=1, help_text="Height in cm", null=True, blank=True)
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')
    tailor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders_as_tailor')
    delivery_partner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders_as_delivery')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Order assignment and deadline fields
    assigned_at = models.DateTimeField(null=True, blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    confirmation_token = models.CharField(max_length=64, blank=True, null=True)
    
    def __str__(self):
        return self.order_code or f"Order {self.id}"
    
    def generate_confirmation_token(self):
        """Generate a unique confirmation token"""
        token = ''.join(random.choices(string.ascii_letters + string.digits, k=64))
        self.confirmation_token = token
        self.save()
        return token
    
    def set_deadline(self):
        """Set deadline to 7 days from now"""
        self.deadline = timezone.now() + timezone.timedelta(days=7)
        self.save()

class OrderLine(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='lines', null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)  
    quantity = models.PositiveIntegerField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Measurements stored as JSON for flexibility based on garment type
    measurements = models.JSONField(default=dict, null=True, blank=True)
    
    def __str__(self):
        return f"{self.product.school.name if self.product and self.product.school else 'No Product'} - {self.product.get_garment_type_display() if self.product else 'No Type'} - Qty: {self.quantity}"

    def get_measurement_fields(self):
        """Return the appropriate measurement fields based on garment type"""
        if not self.product or not self.product.garment_type:
            return []
            
        garment_type = self.product.garment_type
        
        measurement_fields = {
            'shirt_blouse': [
                'neck_circumference', 'chest_bust_circumference', 'waist_circumference',
                'shoulder_width', 'sleeve_length', 'armhole', 'biceps_circumference',
                'wrist_circumference', 'shirt_length_back', 'shirt_length_front',
                'chest_to_waist'
            ],
            'polo_tshirt': [
                'chest_circumference', 'waist_circumference', 'shoulder_width',
                'sleeve_length', 'shirt_length'
            ],
            'trousers_pants': [
                'waist_circumference', 'hip_circumference', 'front_rise', 'back_rise',
                'inseam_length', 'outseam_length', 'thigh_circumference',
                'knee_circumference', 'ankle_circumference', 'waist_to_knee',
                'preferred_hem_allowance'
            ],
            'skirt': [
                'waist_circumference', 'hip_circumference', 'skirt_length_front',
                'skirt_length_back', 'waist_to_hip', 'hem_width',
                'preferred_pleat_count', 'pleat_depth'
            ],
            'shorts': [
                'waist_circumference', 'hip_circumference', 'inseam_length',
                'outseam_length', 'thigh_circumference'
            ],
            'pinafore': [
                'bust_circumference', 'waist_circumference', 'hip_circumference',
                'dress_length_front', 'shoulder_to_waist', 'shoulder_width',
                'armhole', 'back_width'
            ],
            'blazer': [
                'chest_circumference', 'shoulder_width', 'sleeve_length',
                'jacket_length_back', 'waist_circumference', 'bicep_circumference',
                'collar_to_front'
            ],
            'pe_kit': [
                'chest_circumference', 'waist_circumference', 'shoulder_width',
                'sleeve_length', 'length', 'hip_circumference', 'inseam', 'outseam',
                'thigh_circumference'
            ],
            'accessory': [
                'tie_length', 'belt_waist_size'
            ]
        }
        
        return measurement_fields.get(garment_type, [])


class TailorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    schools = models.ManyToManyField(School)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # New fields for tailor registration
    id_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    nationality = models.CharField(max_length=100, null=True, blank=True)
    physical_address = models.TextField(null=True, blank=True)
    town = models.CharField(max_length=100, null=True, blank=True)
    province = models.CharField(max_length=100, null=True, blank=True)
    payment_details = models.TextField(help_text="Bank account details", null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    email_verification_code = models.CharField(max_length=6, blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    business_name = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return self.user.username if self.user else f"TailorProfile {self.id}"
    
    def generate_verification_code(self):
        """Generate a 6-digit verification code"""
        code = ''.join(random.choices(string.digits, k=6))
        self.email_verification_code = code
        self.save()
        return code


class DeliveryPartnerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # New fields for delivery partner registration
    id_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    nationality = models.CharField(max_length=100, null=True, blank=True)
    physical_address = models.TextField(null=True, blank=True)
    town = models.CharField(max_length=100, null=True, blank=True)
    province = models.CharField(max_length=100, null=True, blank=True)
    payment_details = models.TextField(help_text="Bank account details", null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    email_verification_code = models.CharField(max_length=6, blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    vehicle_type = models.CharField(max_length=100, null=True, blank=True)
    license_plate = models.CharField(max_length=20, null=True, blank=True)
    
    def __str__(self):
        return self.user.username if self.user else f"DeliveryPartnerProfile {self.id}"
    
    def generate_verification_code(self):
        """Generate a 6-digit verification code"""
        code = ''.join(random.choices(string.digits, k=6))
        self.email_verification_code = code
        self.save()
        return code

class Shipment(models.Model):
    SHIPMENT_STATUS = (
        ('pending', 'Pending'),
        ('assigned', 'Assigned to Delivery Partner'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
    )
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, null=True, blank=True)
    delivery_partner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=SHIPMENT_STATUS, default='pending')
    tracking_code = models.CharField(max_length=20, blank=True, null=True)
    picked_up_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Shipment for {self.order.order_code if self.order else 'No Order'}"

class Payment(models.Model):
    PAYMENT_METHODS = (
        ('paypal', 'PayPal'),
        # Add other methods if needed
    )
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    method = models.CharField(max_length=50, choices=PAYMENT_METHODS, default='paypal')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment for {self.order.order_code if self.order else 'No Order'}"
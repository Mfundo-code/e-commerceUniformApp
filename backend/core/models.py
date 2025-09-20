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

class Cart(models.Model):
    session_key = models.CharField(max_length=40, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        if self.user:
            return f"Cart for {self.user.username}"
        return f"Anonymous Cart ({self.session_key})"
    
    def get_total(self):
        return sum(item.get_total() for item in self.items.all())

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    # Student information for this specific item
    student_name = models.CharField(max_length=255, null=True, blank=True)
    student_age = models.PositiveIntegerField(help_text="Age in years", null=True, blank=True)
    student_grade = models.CharField(max_length=50, help_text="Grade/Class", null=True, blank=True)
    student_gender = models.CharField(max_length=10, choices=(('male', 'Male'), ('female', 'Female'), ('other', 'Other')), null=True, blank=True)
    student_height = models.DecimalField(max_digits=5, decimal_places=1, help_text="Height in cm", null=True, blank=True)
    # Measurement fields
    measurements = models.JSONField(null=True, blank=True, help_text="Body measurements in cm")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.quantity} x {self.product} for {self.student_name or 'Unknown Student'}"
    
    def get_total(self):
        return self.product.price * self.quantity if self.product.price else 0

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
    # Note: We are moving student information to the OrderLine level, so these might be deprecated.
    # But we keep them for backward compatibility or for orders with a single student.
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
    
    # Student information for this line item
    student_name = models.CharField(max_length=255, null=True, blank=True)
    student_age = models.PositiveIntegerField(help_text="Age in years", null=True, blank=True)
    student_grade = models.CharField(max_length=50, help_text="Grade/Class", null=True, blank=True)
    student_gender = models.CharField(max_length=10, choices=(('male', 'Male'), ('female', 'Female'), ('other', 'Other')), null=True, blank=True)
    student_height = models.DecimalField(max_digits=5, decimal_places=1, help_text="Height in cm", null=True, blank=True)
    
    def __str__(self):
        return f"{self.product.school.name if self.product and self.product.school else 'No Product'} - {self.product.get_garment_type_display() if self.product else 'No Type'} - Qty: {self.quantity}"

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
# core/serializers.py
from rest_framework import serializers
from .models import School, Product, Order, OrderLine, TailorProfile, DeliveryPartnerProfile, Shipment, Payment
from django.contrib.auth.models import User
import random
import string

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    garment_type_display = serializers.CharField(source='get_garment_type_display', read_only=True)
    
    class Meta:
        model = Product
        fields = ('id', 'school', 'school_name', 'description', 'image', 'price', 
                 'garment_type', 'garment_type_display', 'available_sizes', 'created_at')

class OrderLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.school.name', read_only=True)
    garment_type = serializers.CharField(source='product.garment_type', read_only=True)
    garment_type_display = serializers.CharField(source='product.get_garment_type_display', read_only=True)
    
    class Meta:
        model = OrderLine
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    lines = OrderLineSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('order_code', 'status', 'tailor', 'delivery_partner', 'created_at', 'updated_at')

class OrderLineCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderLine
        fields = ('product', 'quantity', 'price', 'measurements')
    
    def validate_measurements(self, value):
        # You could add validation here based on the product's garment type
        # For now, we'll just ensure it's a dictionary
        if not isinstance(value, dict):
            raise serializers.ValidationError("Measurements must be a JSON object.")
        return value

class OrderCreateSerializer(serializers.ModelSerializer):
    lines = OrderLineCreateSerializer(many=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('order_code', 'status', 'tailor', 'delivery_partner', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        order = Order.objects.create(**validated_data)
        
        for line_data in lines_data:
            OrderLine.objects.create(order=order, **line_data)
        
        return order

class TailorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TailorProfile
        fields = '__all__'

class DeliveryPartnerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = DeliveryPartnerProfile
        fields = '__all__'

class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class TailorRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    schools = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(), 
        many=True,
        required=True
    )
    
    class Meta:
        model = TailorProfile
        exclude = ('user', 'is_approved', 'created_at', 'is_email_verified', 'email_verification_code')
    
    def validate_schools(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("You must select at least 3 schools.")
        return value
    
    def create(self, validated_data):
        # Extract user data
        email = validated_data.pop('email')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        password = validated_data.pop('password')
        schools = validated_data.pop('schools')
        
        # Create user
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Create tailor profile
        tailor_profile = TailorProfile.objects.create(
            user=user,
            **validated_data
        )
        
        # Add schools
        tailor_profile.schools.set(schools)
        
        # Generate and send verification code
        verification_code = tailor_profile.generate_verification_code()
        
        # Send email with verification code
        from django.core.mail import send_mail
        from django.conf import settings
        
        subject = 'Email Verification for Tailor Account'
        message = f'''
        Hello {first_name} {last_name},
        
        Thank you for registering as a tailor on our platform.
        Your verification code is: {verification_code}
        
        Please enter this code on the verification page to complete your registration.
        
        Best regards,
        The School Uniforms Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return tailor_profile

class DeliveryPartnerRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = DeliveryPartnerProfile
        exclude = ('user', 'is_approved', 'created_at', 'is_email_verified', 'email_verification')
    
    def create(self, validated_data):
        # Extract user data
        email = validated_data.pop('email')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Create delivery partner profile
        delivery_profile = DeliveryPartnerProfile.objects.create(
            user=user,
            **validated_data
        )
        
        # Generate and send verification code
        verification_code = delivery_profile.generate_verification_code()
        
        # Send email with verification code
        from django.core.mail import send_mail
        from django.conf import settings
        
        subject = 'Email Verification for Delivery Partner Account'
        message = f'''
        Hello {first_name} {last_name},
        
        Thank you for registering as a delivery partner on our platform.
        Your verification code is: {verification_code}
        
        Please enter this code on the verification page to complete your registration.
        
        Best regards,
        The School Uniforms Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return delivery_profile
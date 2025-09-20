from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from .models import (
    School, Product, Cart, CartItem, Order, OrderLine, 
    TailorProfile, DeliveryPartnerProfile, Shipment, Payment
)
import json

# Custom User Admin to display related profiles
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'has_tailor_profile', 'has_delivery_profile')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    
    def has_tailor_profile(self, obj):
        return hasattr(obj, 'tailorprofile')
    has_tailor_profile.boolean = True
    has_tailor_profile.short_description = 'Is Tailor'
    
    def has_delivery_profile(self, obj):
        return hasattr(obj, 'deliverypartnerprofile')
    has_delivery_profile.boolean = True
    has_delivery_profile.short_description = 'Is Delivery Partner'

# Unregister the default User admin and register with our custom one
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'town', 'province', 'is_active', 'created_at')
    list_filter = ('is_active', 'province', 'created_at')
    search_fields = ('name', 'town', 'province')
    list_editable = ('is_active',)
    readonly_fields = ('created_at',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('school', 'garment_type', 'price', 'image_preview', 'created_at')
    list_filter = ('school', 'garment_type', 'created_at')
    search_fields = ('school__name', 'garment_type', 'description')
    readonly_fields = ('created_at', 'image_preview')
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Image Preview'

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session_key', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'session_key')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity', 'student_name', 'created_at')
    list_filter = ('created_at', 'student_gender')
    search_fields = ('cart__session_key', 'student_name', 'product__school__name')
    readonly_fields = ('created_at', 'measurements_preview')
    
    def measurements_preview(self, obj):
        if obj.measurements:
            return format_html('<pre>{}</pre>', json.dumps(obj.measurements, indent=2))
        return "No measurements"
    measurements_preview.short_description = 'Measurements'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_code', 'school', 'customer_name', 'status', 'tailor', 'deadline', 'created_at')
    list_filter = ('status', 'school', 'created_at')
    search_fields = ('order_code', 'customer_name', 'customer_phone', 'student_name')
    readonly_fields = ('order_code', 'confirmation_token', 'created_at', 'updated_at', 'assigned_at')
    list_editable = ('status',)
    
    fieldsets = (
        (None, {
            'fields': ('order_code', 'school', 'status', 'tailor', 'delivery_partner')
        }),
        ('Customer Information', {
            'fields': ('customer_name', 'customer_phone', 'customer_email')
        }),
        ('Student Information', {
            'fields': ('student_name', 'student_age', 'student_grade', 'student_gender', 'student_height')
        }),
        ('Order Details', {
            'fields': ('total_amount', 'deadline', 'confirmation_token')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'assigned_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(OrderLine)
class OrderLineAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'student_name')
    list_filter = ('product__garment_type',)
    search_fields = ('order__order_code', 'product__school__name', 'student_name')

@admin.register(TailorProfile)
class TailorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'id_number', 'nationality', 'town', 'is_approved', 'is_email_verified', 'created_at')
    list_filter = ('is_approved', 'is_email_verified', 'province', 'created_at')
    search_fields = ('user__username', 'user__email', 'id_number', 'user__first_name', 'user__last_name')
    filter_horizontal = ('schools',)
    readonly_fields = ('email_verification_code', 'created_at')
    list_editable = ('is_approved',)
    
    fieldsets = (
        (None, {
            'fields': ('user', 'is_approved', 'is_email_verified')
        }),
        ('Personal Information', {
            'fields': ('id_number', 'nationality', 'physical_address', 'town', 'province', 'phone')
        }),
        ('Business Information', {
            'fields': ('business_name', 'payment_details', 'schools')
        }),
        ('Verification', {
            'fields': ('email_verification_code',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

@admin.register(DeliveryPartnerProfile)
class DeliveryPartnerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'id_number', 'town', 'province', 'vehicle_type', 'is_approved', 'is_email_verified', 'created_at')
    list_filter = ('is_approved', 'is_email_verified', 'province', 'created_at')
    search_fields = ('user__username', 'user__email', 'id_number', 'user__first_name', 'user__last_name')
    readonly_fields = ('email_verification_code', 'created_at')
    list_editable = ('is_approved',)
    
    fieldsets = (
        (None, {
            'fields': ('user', 'is_approved', 'is_email_verified')
        }),
        ('Personal Information', {
            'fields': ('id_number', 'nationality', 'physical_address', 'town', 'province', 'phone')
        }),
        ('Vehicle Information', {
            'fields': ('vehicle_type', 'license_plate')
        }),
        ('Payment Information', {
            'fields': ('payment_details',)
        }),
        ('Verification', {
            'fields': ('email_verification_code',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ('order', 'delivery_partner', 'status', 'tracking_code', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order__order_code', 'tracking_code')
    readonly_fields = ('created_at', 'picked_up_at', 'delivered_at')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'amount', 'method', 'status', 'created_at')
    list_filter = ('status', 'method', 'created_at')
    search_fields = ('order__order_code', 'transaction_id')
    readonly_fields = ('created_at', 'updated_at')
# core/admin.py
from django.contrib import admin
from .models import School, Product, Order, OrderLine, TailorProfile, DeliveryPartnerProfile, Shipment, Payment
import json

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'town', 'province', 'is_active', 'created_at')
    list_filter = ('is_active', 'province', 'created_at')
    search_fields = ('name', 'town', 'province')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('school', 'garment_type', 'price', 'created_at')
    list_filter = ('school', 'garment_type', 'created_at')
    search_fields = ('school__name', 'garment_type')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_code', 'school', 'customer_name', 'student_name', 'status', 'tailor', 'deadline', 'created_at')
    list_filter = ('status', 'school', 'created_at')
    search_fields = ('order_code', 'customer_name', 'customer_phone', 'student_name')
    readonly_fields = ('confirmation_token', 'created_at', 'updated_at', 'assigned_at')
    
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
    list_display = ('order', 'product', 'quantity', 'price')
    list_filter = ('product__garment_type',)
    search_fields = ('order__order_code', 'product__school__name')
    
    readonly_fields = ('formatted_measurements',)
    
    def formatted_measurements(self, obj):
        if obj.measurements:
            return json.dumps(obj.measurements, indent=2)
        return "No measurements provided"
    formatted_measurements.short_description = 'Measurements (JSON)'

@admin.register(TailorProfile)
class TailorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'id_number', 'nationality', 'town', 'is_approved', 'is_email_verified', 'created_at')
    list_filter = ('is_approved', 'is_email_verified', 'province', 'created_at')
    search_fields = ('user__username', 'user__email', 'id_number', 'user__first_name', 'user__last_name')
    filter_horizontal = ('schools',)
    readonly_fields = ('is_email_verified', 'created_at')
    
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
    readonly_fields = ('is_email_verified', 'created_at')
    
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
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ('order', 'delivery_partner', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order__order_code', 'tracking_code')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'amount', 'method', 'status', 'created_at')
    list_filter = ('status', 'method', 'created_at')
    search_fields = ('order__order_code', 'transaction_id')
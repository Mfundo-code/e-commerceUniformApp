from django.urls import path
from . import userviews, tailorviews, deliveryviews, paymentviews, orderviews, schoolsviews, productsviews, measurementviews, cartviews

urlpatterns = [
    # Authentication
    path('auth/register/', userviews.RegisterView.as_view(), name='auth-register'),
    path('auth/profile/', userviews.UserProfileView.as_view(), name='auth-profile'),
    path('auth/tailor/register/', userviews.TailorRegistrationView.as_view(), name='tailor-register'),
    path('auth/delivery/register/', userviews.DeliveryPartnerRegistrationView.as_view(), name='delivery-register'),
    path('auth/verify-email/', userviews.VerifyEmailView.as_view(), name='verify-email'),
    path('auth/resend-verification/', userviews.ResendVerificationView.as_view(), name='resend-verification'),
    
    # Public endpoints
    path('schools/', schoolsviews.SchoolListView.as_view(), name='schools-list'),
    path('schools/<int:pk>/', schoolsviews.SchoolDetailView.as_view(), name='school-detail'),
    path('schools/<int:school_id>/products/', productsviews.ProductListView.as_view(), name='school-products'),
    path('checkout/guest/', orderviews.GuestCheckoutView.as_view(), name='guest-checkout'),
    path('orders/<str:order_code>/', orderviews.OrderLookupView.as_view(), name='order-lookup'),
    path('measurements/template/', measurementviews.MeasurementTemplateView.as_view(), name='measurement-template'),
    path('tailor/confirm-order/<str:confirmation_token>/', orderviews.TailorOrderConfirmationView.as_view(), name='tailor-confirm-order'),
    
    # Payment endpoints
    path('payments/initiate/', paymentviews.PaymentInitiateView.as_view(), name='payment-initiate'),
    path('payments/execute/', paymentviews.PaymentExecuteView.as_view(), name='payment-execute'),
    path('payments/status/', paymentviews.PaymentStatusView.as_view(), name='payment-status'),
    path('payments/webhook/', paymentviews.PaymentWebhookView.as_view(), name='payment-webhook'),
    
    # Cart endpoints
    path('cart/', cartviews.CartView.as_view(), name='cart-detail'),
    path('cart/add/', cartviews.AddToCartView.as_view(), name='add-to-cart'),
    path('cart/update/<int:pk>/', cartviews.UpdateCartItemView.as_view(), name='update-cart-item'),
    path('cart/remove/<int:pk>/', cartviews.RemoveFromCartView.as_view(), name='remove-from-cart'),
    
    # Tailor endpoints
    path('tailor/orders/', tailorviews.TailorOrderListView.as_view(), name='tailor-orders'),
    path('tailor/orders/<int:id>/status/', tailorviews.TailorOrderUpdateView.as_view(), name='tailor-order-update'),
    
    # Delivery endpoints
    path('delivery/shipments/', deliveryviews.DeliveryShipmentListView.as_view(), name='delivery-shipments'),
    path('delivery/shipments/<int:id>/status/', deliveryviews.DeliveryShipmentUpdateView.as_view(), name='delivery-shipment-update'),
    
    # Super Admin endpoints
    path('admin/products/', productsviews.ProductCreateView.as_view(), name='product-create'),
    path('admin/products/<int:pk>/', productsviews.ProductManagementView.as_view(), name='product-management'),
    path('admin/schools/<int:pk>/', schoolsviews.SchoolManagementView.as_view(), name='school-management'),
    path('admin/users/', userviews.UserListView.as_view(), name='user-list'),
    path('admin/tailors/<int:id>/approval/', userviews.TailorApprovalView.as_view(), name='tailor-approval'),
    path('admin/delivery-partners/<int:id>/approval/', userviews.DeliveryPartnerApprovalView.as_view(), name='delivery-approval'),
]
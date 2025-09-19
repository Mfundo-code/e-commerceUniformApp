# core/cartviews.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.utils.crypto import get_random_string
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer

class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.AllowAny]  # Allow anonymous users
    
    def get_object(self):
        # Get or create cart based on session
        session_key = self.request.session.session_key
        if not session_key:
            self.request.session.create()
            session_key = self.request.session.session_key
            self.request.session.modified = True
        
        cart, created = Cart.objects.get_or_create(session_key=session_key)
        return cart

class AddToCartView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.AllowAny]  # Allow anonymous users
    
    def create(self, request, *args, **kwargs):
        # Get or create cart
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
            request.session.modified = True
        
        cart, created = Cart.objects.get_or_create(session_key=session_key)
        
        # Add item to cart
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check if similar item already exists in cart
        product_id = request.data.get('product')
        student_name = request.data.get('student_name')
        
        existing_item = CartItem.objects.filter(
            cart=cart, 
            product_id=product_id, 
            student_name=student_name
        ).first()
        
        if existing_item:
            # Update quantity if item exists
            existing_item.quantity += int(request.data.get('quantity', 1))
            existing_item.save()
            serializer = self.get_serializer(existing_item)
        else:
            # Create new item
            serializer.save(cart=cart)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UpdateCartItemView(generics.UpdateAPIView):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [permissions.AllowAny]  # Allow anonymous users
    
    def update(self, request, *args, **kwargs):
        # Verify the cart item belongs to the user's cart
        session_key = request.session.session_key
        cart_item = self.get_object()
        
        if cart_item.cart.session_key != session_key:
            return Response(
                {"error": "You don't have permission to modify this item."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)

class RemoveFromCartView(generics.DestroyAPIView):
    queryset = CartItem.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow anonymous users
    
    def destroy(self, request, *args, **kwargs):
        # Verify the cart item belongs to the user's cart
        session_key = request.session.session_key
        cart_item = self.get_object()
        
        if cart_item.cart.session_key != session_key:
            return Response(
                {"error": "You don't have permission to remove this item."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
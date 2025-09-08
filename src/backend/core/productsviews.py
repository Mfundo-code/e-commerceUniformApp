# core/productsviews.py
from rest_framework import generics, permissions
from .models import Product, School
from .serializers import ProductSerializer

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = []  # Public access
    
    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return Product.objects.filter(school_id=school_id)

class ProductManagementView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
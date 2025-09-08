# core/schoolsviews.py
from rest_framework import generics, permissions
from .models import School
from .serializers import SchoolSerializer

class SchoolListView(generics.ListAPIView):
    queryset = School.objects.filter(is_active=True)
    serializer_class = SchoolSerializer
    permission_classes = []  # Public access

class SchoolDetailView(generics.RetrieveAPIView):
    queryset = School.objects.filter(is_active=True)
    serializer_class = SchoolSerializer
    permission_classes = []  # Public access

class SchoolManagementView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
# core/userviews.py
from rest_framework import generics, permissions
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from .models import TailorProfile, DeliveryPartnerProfile
from .serializers import UserSerializer, TailorProfileSerializer, DeliveryPartnerProfileSerializer, RegisterSerializer, TailorRegistrationSerializer, DeliveryPartnerRegistrationSerializer

class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TailorApprovalView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = TailorProfile.objects.all()
    serializer_class = TailorProfileSerializer
    lookup_field = 'id'

class DeliveryPartnerApprovalView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = DeliveryPartnerProfile.objects.all()
    serializer_class = DeliveryPartnerProfileSerializer
    lookup_field = 'id'

class TailorRegistrationView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = TailorRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        # Check if email already exists
        email = request.data.get('email')
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if ID number already exists
        id_number = request.data.get('id_number')
        if TailorProfile.objects.filter(id_number=id_number).exists():
            return Response(
                {"error": "ID number already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tailor_profile = serializer.save()
        
        return Response({
            "message": "Registration successful. Please check your email for verification code.",
            "email": email
        }, status=status.HTTP_201_CREATED)

class DeliveryPartnerRegistrationView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = DeliveryPartnerRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        # Check if email already exists
        email = request.data.get('email')
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if ID number already exists
        id_number = request.data.get('id_number')
        if DeliveryPartnerProfile.objects.filter(id_number=id_number).exists():
            return Response(
                {"error": "ID number already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        delivery_profile = serializer.save()
        
        return Response({
            "message": "Registration successful. Please check your email for verification code.",
            "email": email
        }, status=status.HTTP_201_CREATED)

class VerifyEmailView(generics.UpdateAPIView):
    permission_classes = [permissions.AllowAny]
    
    def update(self, request, *args, **kwargs):
        email = request.data.get('email')
        verification_code = request.data.get('verification_code')
        user_type = request.data.get('user_type', 'tailor')  # 'tailor' or 'delivery'
        
        try:
            # Find user by email
            user = User.objects.get(email=email)
            
            if user_type == 'tailor':
                profile = TailorProfile.objects.get(user=user)
                profile_name = "Tailor"
            else:
                profile = DeliveryPartnerProfile.objects.get(user=user)
                profile_name = "Delivery Partner"
            
            if profile.is_email_verified:
                return Response(
                    {"error": "Email already verified."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if profile.email_verification_code == verification_code:
                profile.is_email_verified = True
                profile.email_verification_code = ''  # Clear the code
                profile.save()
                
                return Response({
                    "message": f"Email verified successfully. Your {profile_name} account is pending admin approval."
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Invalid verification code."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )
        except (TailorProfile.DoesNotExist, DeliveryPartnerProfile.DoesNotExist):
            return Response(
                {"error": f"{user_type.capitalize()} profile not found for this user."},
                status=status.HTTP_404_NOT_FOUND
            )

class ResendVerificationView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        user_type = request.data.get('user_type', 'tailor')  # 'tailor' or 'delivery'
        
        try:
            user = User.objects.get(email=email)
            
            if user_type == 'tailor':
                profile = TailorProfile.objects.get(user=user)
                profile_name = "Tailor"
            else:
                profile = DeliveryPartnerProfile.objects.get(user=user)
                profile_name = "Delivery Partner"
            
            if profile.is_email_verified:
                return Response(
                    {"error": "Email already verified."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate and send new verification code
            verification_code = profile.generate_verification_code()
            
            # Send email with verification code
            from django.core.mail import send_mail
            from django.conf import settings
            
            subject = f'New Verification Code for {profile_name} Account'
            message = f'''
            Hello {user.first_name} {user.last_name},
            
            Your new verification code is: {verification_code}
            
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
            
            return Response({
                "message": f"New verification code sent to your email for your {profile_name} account."
            }, status=status.HTTP_200_OK)
                
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )
        except (TailorProfile.DoesNotExist, DeliveryPartnerProfile.DoesNotExist):
            return Response(
                {"error": f"{user_type.capitalize()} profile not found for this user."},
                status=status.HTTP_404_NOT_FOUND
            )
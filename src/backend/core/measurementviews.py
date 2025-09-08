# core/measurementviews.py
from rest_framework import generics
from rest_framework.response import Response
from .models import Product
from django.http import JsonResponse

class MeasurementTemplateView(generics.RetrieveAPIView):
    def get(self, request, *args, **kwargs):
        product_id = request.GET.get('product_id')
        
        if not product_id:
            return Response({"error": "product_id parameter is required"}, status=400)
        
        try:
            product = Product.objects.get(id=product_id)
            garment_type = product.garment_type
            
            measurement_templates = {
                'shirt_blouse': {
                    'name': 'Shirt/Blouse Measurements',
                    'fields': [
                        {'name': 'neck_circumference', 'label': 'Neck Circumference', 'unit': 'cm'},
                        {'name': 'chest_bust_circumference', 'label': 'Chest/Bust Circumference', 'unit': 'cm'},
                        {'name': 'waist_circumference', 'label': 'Waist Circumference', 'unit': 'cm'},
                        {'name': 'shoulder_width', 'label': 'Shoulder Width', 'unit': 'cm'},
                        {'name': 'sleeve_length', 'label': 'Sleeve Length', 'unit': 'cm'},
                        {'name': 'armhole', 'label': 'Armhole', 'unit': 'cm', 'optional': True},
                        {'name': 'biceps_circumference', 'label': 'Biceps Circumference', 'unit': 'cm'},
                        {'name': 'wrist_circumference', 'label': 'Wrist Circumference', 'unit': 'cm'},
                        {'name': 'shirt_length_back', 'label': 'Shirt Length (Back)', 'unit': 'cm'},
                        {'name': 'shirt_length_front', 'label': 'Shirt Length (Front)', 'unit': 'cm', 'optional': True},
                        {'name': 'chest_to_waist', 'label': 'Chest to Waist', 'unit': 'cm', 'optional': True},
                    ]
                },
                'polo_tshirt': {
                    'name': 'Polo/T-shirt Measurements',
                    'fields': [
                        {'name': 'chest_circumference', 'label': 'Chest Circumference', 'unit': 'cm'},
                        {'name': 'waist_circumference', 'label': 'Waist Circumference', 'unit': 'cm'},
                        {'name': 'shoulder_width', 'label': 'Shoulder Width', 'unit': 'cm'},
                        {'name': 'sleeve_length', 'label': 'Sleeve Length', 'unit': 'cm'},
                        {'name': 'shirt_length', 'label': 'Shirt Length', 'unit': 'cm'},
                    ]
                },
                'trousers_pants': {
                    'name': 'Trousers/Pants Measurements',
                    'fields': [
                        {'name': 'waist_circumference', 'label': 'Waist Circumference', 'unit': 'cm'},
                        {'name': 'hip_circumference', 'label': 'Hip Circumference', 'unit': 'cm'},
                        {'name': 'front_rise', 'label': 'Front Rise', 'unit': 'cm'},
                        {'name': 'back_rise', 'label': 'Back Rise', 'unit': 'cm'},
                        {'name': 'inseam_length', 'label': 'Inseam Length', 'unit': 'cm'},
                        {'name': 'outseam_length', 'label': 'Outseam Length', 'unit': 'cm'},
                        {'name': 'thigh_circumference', 'label': 'Thigh Circumference', 'unit': 'cm'},
                        {'name': 'knee_circumference', 'label': 'Knee Circumference', 'unit': 'cm', 'optional': True},
                        {'name': 'ankle_circumference', 'label': 'Ankle Circumference', 'unit': 'cm'},
                        {'name': 'waist_to_knee', 'label': 'Waist to Knee', 'unit': 'cm', 'optional': True},
                        {'name': 'preferred_hem_allowance', 'label': 'Preferred Hem Allowance', 'unit': 'cm'},
                    ]
                },
                'skirt': {
                    'name': 'Skirt Measurements',
                    'fields': [
                        {'name': 'waist_circumference', 'label': 'Waist Circumference', 'unit': 'cm'},
                        {'name': 'hip_circumference', 'label': 'Hip Circumference', 'unit': 'cm'},
                        {'name': 'skirt_length_front', 'label': 'Skirt Length (Front)', 'unit': 'cm'},
                        {'name': 'skirt_length_back', 'label': 'Skirt Length (Back)', 'unit': 'cm'},
                        {'name': 'waist_to_hip', 'label': 'Waist to Hip', 'unit': 'cm'},
                        {'name': 'hem_width', 'label': 'Hem Width', 'unit': 'cm', 'optional': True},
                        {'name': 'preferred_pleat_count', 'label': 'Preferred Pleat Count', 'unit': 'count', 'optional': True},
                        {'name': 'pleat_depth', 'label': 'Pleat Depth', 'unit': 'cm', 'optional': True},
                    ]
                },
                'shorts': {
                    'name': 'Shorts Measurements',
                    'fields': [
                        {'name': 'waist_circumference', 'label': 'Waist Circumference', 'unit': 'cm'},
                        {'name': 'hip_circumference', 'label': 'Hip Circumference', 'unit': 'cm'},
                        {'name': 'inseam_length', 'label': 'Inseam Length', 'unit': 'cm'},
                        {'name': 'outseam_length', 'label': 'Outseam Length', 'unit': 'cm'},
                        {'name': 'thigh_circumference', 'label': 'Thigh Circumference', 'unit': 'cm'},
                    ]
                },
                'pinafore': {
                    'name': 'Pinafore/Overall/Dress Measurements',
                    'fields': [
                        {'name': 'bust_circumference', 'label': 'Bust Circumference', 'unit': 'cm'},
                        {'name': 'waist_circumference', 'label': 'Waist Circumference', 'unit': 'cm'},
                        {'name': 'hip_circumference', 'label': 'Hip Circumference', 'unit': 'cm'},
                        {'name': 'dress_length_front', 'label': 'Dress Length (Front)', 'unit': 'cm'},
                        {'name': 'shoulder_to_waist', 'label': 'Shoulder to Waist', 'unit': 'cm'},
                        {'name': 'shoulder_width', 'label': 'Shoulder Width', 'unit': 'cm'},
                        {'name': 'armhole', 'label': 'Armhole', 'unit': 'cm'},
                        {'name': 'back_width', 'label': 'Back Width', 'unit': 'cm'},
                    ]
                },
                'blazer': {
                    'name': 'Blazer/Jacket Measurements',
                    'fields': [
                        {'name': 'chest_circumference', 'label': 'Chest Circumference', 'unit': 'cm'},
                        {'name': 'shoulder_width', 'label': 'Shoulder Width', 'unit': 'cm'},
                        {'name': 'sleeve_length', 'label': 'Sleeve Length', 'unit': 'cm'},
                        {'name': 'jacket_length_back', 'label': 'Jacket Length (Back)', 'unit': 'cm'},
                        {'name': 'waist_circumference', 'label': 'Waist Circumference', 'unit': 'cm'},
                        {'name': 'bicep_circumference', 'label': 'Bicep Circumference', 'unit': 'cm'},
                        {'name': 'collar_to_front', 'label': 'Collar to Front', 'unit': 'cm', 'optional': True},
                    ]
                },
                'pe_kit': {
                    'name': 'PE Kit Measurements',
                    'fields': [
                        {'name': 'chest_circumference', 'label': 'Chest Circumference', 'unit': 'cm'},
                        {'name': 'waist_circumference', 'label': 'Waist Circumference', 'unit': 'cm'},
                        {'name': 'shoulder_width', 'label': 'Shoulder Width', 'unit': 'cm'},
                        {'name': 'sleeve_length', 'label': 'Sleeve Length', 'unit': 'cm'},
                        {'name': 'length', 'label': 'Length', 'unit': 'cm'},
                        {'name': 'hip_circumference', 'label': 'Hip Circumference', 'unit': 'cm'},
                        {'name': 'inseam', 'label': 'Inseam', 'unit': 'cm'},
                        {'name': 'outseam', 'label': 'Outseam', 'unit': 'cm'},
                        {'name': 'thigh_circumference', 'label': 'Thigh Circumference', 'unit': 'cm'},
                    ]
                },
                'accessory': {
                    'name': 'Accessory Measurements',
                    'fields': [
                        {'name': 'tie_length', 'label': 'Tie Length', 'unit': 'cm'},
                        {'name': 'belt_waist_size', 'label': 'Belt Waist Size', 'unit': 'cm'},
                    ]
                }
            }
            
            template = measurement_templates.get(garment_type, {'name': 'Custom Measurements', 'fields': []})
            return Response(template)
            
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)
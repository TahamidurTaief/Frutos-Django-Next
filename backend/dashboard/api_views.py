# dashboard/api_views.py
import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from products.models import Color, Size


@login_required
@require_http_methods(["POST"])
def add_color(request):
    """API endpoint to add a new color"""
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        hex_code = data.get('hex_code', '').strip()
        
        if not name or not hex_code:
            return JsonResponse({'success': False, 'error': 'Name and hex code are required'})
        
        # Check if color already exists
        if Color.objects.filter(name__iexact=name).exists():
            return JsonResponse({'success': False, 'error': 'Color already exists'})
        
        if Color.objects.filter(hex_code__iexact=hex_code).exists():
            return JsonResponse({'success': False, 'error': 'Hex code already exists'})
        
        # Create color
        color = Color.objects.create(name=name, hex_code=hex_code.upper())
        
        return JsonResponse({
            'success': True,
            'color': {
                'id': color.id,
                'name': color.name,
                'hex_code': color.hex_code
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
@require_http_methods(["POST"])
def add_size(request):
    """API endpoint to add a new size"""
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        
        if not name:
            return JsonResponse({'success': False, 'error': 'Size name is required'})
        
        # Check if size already exists
        if Size.objects.filter(name__iexact=name).exists():
            return JsonResponse({'success': False, 'error': 'Size already exists'})
        
        # Create size
        size = Size.objects.create(name=name)
        
        return JsonResponse({
            'success': True,
            'size': {
                'id': size.id,
                'name': size.name
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

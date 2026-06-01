# dashboard/api_views.py
import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from products.models import Color, Size, SubCategory


@login_required
@require_http_methods(["POST"])
def add_color(request):
    """API endpoint to add a new color"""
    try:
        data     = json.loads(request.body)
        name     = data.get('name', '').strip()
        hex_code = data.get('hex_code', '').strip()

        if not name or not hex_code:
            return JsonResponse({'success': False, 'error': 'Name and hex code are required'})

        if Color.objects.filter(name__iexact=name).exists():
            return JsonResponse({'success': False, 'error': 'Color already exists'})

        color = Color.objects.create(name=name, hex_code=hex_code.upper())
        return JsonResponse({'success': True, 'color': {'id': color.id, 'name': color.name, 'hex_code': color.hex_code}})
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

        if Size.objects.filter(name__iexact=name).exists():
            return JsonResponse({'success': False, 'error': 'Size already exists'})

        size = Size.objects.create(name=name)
        return JsonResponse({'success': True, 'size': {'id': size.id, 'name': size.name}})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
@require_http_methods(["GET"])
def get_subcategories(request):
    """
    ✅ NEW: Category ID দিয়ে SubCategory list পাওয়ার API
    Usage: GET /dashboard/api/subcategories/?category_id=5
    Returns JSON list of subcategories for the given category
    """
    category_id = request.GET.get('category_id', '')

    qs = SubCategory.objects.select_related('category').order_by('name')
    if category_id:
        qs = qs.filter(category_id=category_id)

    data = [
        {
            'id':            sub.id,
            'name':          sub.name,
            'category_id':   sub.category_id,
            'category_name': sub.category.name,
            'display':       f"{sub.category.name} › {sub.name}",
        }
        for sub in qs
    ]
    return JsonResponse({'subcategories': data})
"""
Dashboard Context Processors
Provides sidebar navigation to all dashboard templates
"""

from .model_inspector import get_model_groups
from .config import user_has_model_permission


def dashboard_context(request):
    """
    Add dashboard navigation to all templates
    """
    if not request.path.startswith('/dashboard/'):
        return {}
    
    # Build navigation with permission checking
    navigation = []
    
    for group in get_model_groups():
        accessible_models = []
        
        for model_info in group['models']:
            model_class = model_info['model_class']
            
            # Check if user has view permission
            if request.user.is_authenticated and user_has_model_permission(request.user, model_class, 'view'):
                accessible_models.append({
                    'app_label': model_info['app_label'],
                    'model_name': model_info['model_name'],
                    'verbose_name': model_info['verbose_name'],
                    'verbose_name_plural': model_info['verbose_name_plural'],
                    'url': f"/dashboard/{model_info['app_label']}/{model_info['model_name']}/",
                })
        
        # Only add group if user can access at least one model
        if accessible_models:
            navigation.append({
                'title': group['title'],
                'icon': group['icon'],
                'models': accessible_models
            })
    
    return {
        'dashboard_navigation': navigation,
    }

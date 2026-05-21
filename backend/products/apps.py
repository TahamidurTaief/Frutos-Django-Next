from django.apps import AppConfig


class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'products'

    def ready(self):
        # Import signal handlers to hook into product save/delete events
        try:
            from . import signals  # noqa: F401
        except Exception:
            pass

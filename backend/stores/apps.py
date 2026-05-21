from django.apps import AppConfig


class StoresConfig(AppConfig):
    name = 'stores'

    def ready(self):
        # Import signal handlers to hook into store save/delete events
        try:
            from . import signals  # noqa: F401
        except Exception:
            pass

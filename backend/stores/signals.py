"""
stores/signals.py - Trigger frontend revalidation on store changes
"""
import os
import requests
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Store


# Frontend revalidation endpoint (must be set in environment)
FRONTEND_REVALIDATE_URL = os.getenv(
    'FRONTEND_REVALIDATE_URL',
    'http://localhost:3000/api/revalidate'
)
REVALIDATE_SECRET = os.getenv('REVALIDATE_SECRET', '')


def _post_revalidate(tags: list):
    """
    POST to frontend revalidate endpoint to clear cache for given tags.
    
    Args:
        tags: List of cache tag strings to revalidate (e.g., ['stores', 'store-1'])
    """
    if not REVALIDATE_SECRET:
        # Silently skip if secret not set in environment
        return

    for tag in tags:
        try:
            response = requests.post(
                FRONTEND_REVALIDATE_URL,
                json={'secret': REVALIDATE_SECRET, 'tag': tag},
                timeout=5
            )
            if response.status_code != 200:
                print(f'[stores.signals] Revalidate tag "{tag}" returned {response.status_code}')
        except Exception as e:
            print(f'[stores.signals] Error revalidating tag "{tag}": {e}')


@receiver(post_save, sender=Store)
def store_post_save(sender, instance, created, **kwargs):
    """Trigger revalidation when a store is saved or created."""
    tags = [f'store-{instance.id}', 'stores']
    _post_revalidate(tags)


@receiver(post_delete, sender=Store)
def store_post_delete(sender, instance, **kwargs):
    """Trigger revalidation when a store is deleted."""
    _post_revalidate(['stores'])

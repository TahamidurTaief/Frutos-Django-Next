import os
import logging
import requests
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Product

logger = logging.getLogger(__name__)

REVALIDATE_URL = os.environ.get('FRONTEND_REVALIDATE_URL', 'http://localhost:3000/api/revalidate')
REVALIDATE_SECRET = os.environ.get('REVALIDATE_SECRET')


def _post_revalidate(tags):
    """
    Revalidate frontend cache by calling Next.js ISR endpoint.
    This ensures newly added/updated products appear instantly on the website.
    """
    if not REVALIDATE_SECRET:
        logger.warning(
            f'REVALIDATE_SECRET not set. Frontend cache will not be revalidated. '
            f'Set REVALIDATE_SECRET environment variable to enable instant product visibility.'
        )
        return
    
    try:
        # If tags is a list, send multiple requests for each tag, else send single
        if isinstance(tags, (list, tuple)):
            for t in tags:
                response = requests.post(
                    REVALIDATE_URL, 
                    json={'secret': REVALIDATE_SECRET, 'tag': t}, 
                    timeout=5
                )
                logger.info(
                    f'Revalidate request for tag="{t}" to {REVALIDATE_URL} '
                    f'returned status {response.status_code}'
                )
        else:
            response = requests.post(
                REVALIDATE_URL, 
                json={'secret': REVALIDATE_SECRET, 'tag': tags}, 
                timeout=5
            )
            logger.info(
                f'Revalidate request for tag="{tags}" to {REVALIDATE_URL} '
                f'returned status {response.status_code}'
            )
    except requests.exceptions.Timeout:
        logger.warning(
            f'Revalidate request timed out after 5s to {REVALIDATE_URL}. '
            f'Frontend cache may not be updated.'
        )
    except requests.exceptions.ConnectionError as e:
        logger.warning(
            f'Failed to connect to frontend at {REVALIDATE_URL}: {e}. '
            f'Is the Next.js frontend running?'
        )
    except Exception as e:
        logger.error(
            f'Unexpected error during frontend revalidate: {e}. '
            f'URL: {REVALIDATE_URL}, Tags: {tags}',
            exc_info=True
        )


@receiver(post_save, sender=Product)
def product_saved(sender, instance, created, **kwargs):
    """
    Revalidate frontend cache when product is saved.
    Triggers for both new products (created=True) and updates.
    """
    action = 'created' if created else 'updated'
    logger.info(f'Product {action}: {instance.name} (ID: {instance.id})')
    
    tags = [f'product-{instance.id}', 'products']
    _post_revalidate(tags)


@receiver(post_delete, sender=Product)
def product_deleted(sender, instance, **kwargs):
    """
    Revalidate frontend cache when product is deleted.
    """
    logger.info(f'Product deleted: {instance.name} (ID: {instance.id})')
    
    tags = ['products']
    _post_revalidate(tags)

from django.db.models.signals import post_delete
from django.dispatch import receiver
from rebuc_app.models import Release
import logging


logger = logging.getLogger(__name__)


@receiver(post_delete, sender=Release)
def post_release_delete(sender, instance, using, **kwargs):
    """
    Signal for removing build mask when release deleted
    :param sender:
    :param instance: Release instance
    :param using:
    :param kwargs:
    :return:
    """
    logger.info("Release deleted. In post_delete signal.")
    build_mask = instance.release_pattern.build_mask
    build_mask.delete()
    logger.info("Build mask and associated release pattern deleted.")

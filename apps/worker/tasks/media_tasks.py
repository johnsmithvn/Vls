"""
Media processing tasks: resize images, convert videos.
Triggered after file upload to Cloudflare R2.
"""

from celery_app import celery_app


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def process_media(self, asset_id: str) -> dict:
    """
    Download raw file from R2, convert/compress, re-upload processed version.
    Update sign_assets.url in database.
    """
    # TODO: Implement in Sprint 1.3
    return {"status": "processed", "asset_id": asset_id}

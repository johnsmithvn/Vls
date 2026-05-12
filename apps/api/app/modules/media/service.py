"""
Media service — Pre-signed URL generation for Cloudflare R2.
"""

import uuid
from datetime import datetime

import boto3
from botocore.config import Config

from app.core.config import settings


def _get_r2_client():
    """Create S3-compatible client for Cloudflare R2."""
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def generate_presigned_upload_url(
    filename: str,
    content_type: str,
) -> tuple[str, str]:
    """
    Generate a pre-signed URL for direct upload to R2.
    Returns (presigned_url, object_key).
    """
    # Generate unique object key: uploads/2026/05/uuid_filename
    now = datetime.utcnow()
    object_key = f"uploads/{now.year}/{now.month:02d}/{uuid.uuid4()}_{filename}"

    client = _get_r2_client()
    presigned_url = client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.R2_BUCKET_NAME,
            "Key": object_key,
            "ContentType": content_type,
        },
        ExpiresIn=600,  # 10 minutes
    )

    public_url = f"{settings.R2_PUBLIC_URL}/{object_key}"
    return presigned_url, public_url

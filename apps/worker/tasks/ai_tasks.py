"""
AI tasks: generate embeddings, process NLP.
"""

from celery_app import celery_app


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def generate_embedding(self, word_id: str) -> dict:
    """
    Generate vector embedding for a word's semantic tags.
    Store in pgvector column.
    """
    # TODO: Implement in Phase 3
    return {"status": "generated", "word_id": word_id}

"""
Sign Language OS — FastAPI Application Entrypoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import AppException, app_exception_handler, generic_exception_handler
from app.modules.admin.router import router as admin_router
from app.modules.auth.router import router as auth_router
from app.modules.dictionary.router import router as dictionary_router
from app.modules.media.router import router as media_router
from app.modules.notebook.router import router as notebook_router
from app.modules.translation.router import router as translation_router

app = FastAPI(
    title="Sign Language OS API",
    version="1.0.0",
    description="Structured Sign Knowledge Graph API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── Exception Handlers ──────────────────────────────────────
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# ── CORS ────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(dictionary_router, prefix="/api/v1/dictionary", tags=["dictionary"])
app.include_router(media_router, prefix="/api/v1/media", tags=["media"])
app.include_router(notebook_router, prefix="/api/v1/notebook", tags=["notebook"])
app.include_router(translation_router, prefix="/api/v1/translation", tags=["translation"])


@app.get("/api/v1/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "success": True,
        "message": "Sign Language OS API is running",
        "data": {"version": "0.1.0", "environment": settings.ENVIRONMENT},
        "meta": None,
    }

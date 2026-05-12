"""
Alembic migration environment.
Configured to auto-detect all SQLAlchemy models via Base.metadata.
"""

import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import engine_from_config, pool

from alembic import context

# Add the api app to Python path so imports work
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import all models so Alembic can detect them for autogenerate
from app.db.base import Base  # noqa: E402
from app.modules.dictionary.models import Word, CanonicalSign, SignAsset  # noqa: E402, F401
from app.modules.auth.models import User, UserBookmark  # noqa: E402, F401
from app.modules.translation.models import QueryLog  # noqa: E402, F401

target_metadata = Base.metadata

# Override sqlalchemy.url from environment variable if available
from app.core.config import settings  # noqa: E402

config.set_main_option(
    "sqlalchemy.url",
    settings.DATABASE_URL.replace("+asyncpg", ""),  # Alembic uses sync driver
)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

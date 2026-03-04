"""Shared logging configuration for pptx skills.

Provides a consistent logging setup across all pptx-* skills.
Log level can be controlled via the PPTX_LOG_LEVEL environment variable.

Usage:
    from shared.logging_config import get_logger

    logger = get_logger(__name__)
    logger.debug("Processing element %d", i)
    logger.info("Created slide %s", slide_name)
    logger.warning("Image not found: %s", path)
    logger.error("Invalid spec structure")

Environment variables:
    PPTX_LOG_LEVEL: Set to DEBUG, INFO, WARNING, or ERROR (default: INFO)
"""

import logging
import os
import sys
from typing import Optional


# Module-level logger cache
_loggers: dict[str, logging.Logger] = {}
_handler_configured = False


def setup_logging(
    name: str = "pptx",
    level: Optional[str] = None,
    format_string: Optional[str] = None
) -> logging.Logger:
    """Configure and return a logger.

    Args:
        name: Logger name (typically __name__ of calling module)
        level: Log level override (default: from PPTX_LOG_LEVEL or INFO)
        format_string: Custom format string (default: standard format)

    Returns:
        Configured logger instance
    """
    global _handler_configured

    # Determine log level
    if level is None:
        level = os.environ.get("PPTX_LOG_LEVEL", "INFO").upper()

    level_value = getattr(logging, level, logging.INFO)

    # Get or create logger
    logger = logging.getLogger(name)
    logger.setLevel(level_value)

    # Configure root handler once (prevents duplicate output)
    if not _handler_configured:
        root_logger = logging.getLogger()

        # Remove any existing handlers
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)

        # Create stderr handler
        handler = logging.StreamHandler(sys.stderr)
        handler.setLevel(logging.DEBUG)  # Handler accepts all, logger filters

        # Set format
        if format_string is None:
            format_string = "%(levelname)s [%(name)s] %(message)s"

        formatter = logging.Formatter(format_string)
        handler.setFormatter(formatter)
        root_logger.addHandler(handler)

        _handler_configured = True

    return logger


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Get a logger instance (cached).

    Args:
        name: Logger name (default: "pptx")

    Returns:
        Logger instance
    """
    if name is None:
        name = "pptx"

    if name not in _loggers:
        _loggers[name] = setup_logging(name)

    return _loggers[name]


def set_log_level(level: str) -> None:
    """Set log level for all pptx loggers.

    Args:
        level: Level name (DEBUG, INFO, WARNING, ERROR)
    """
    level_value = getattr(logging, level.upper(), logging.INFO)

    for logger in _loggers.values():
        logger.setLevel(level_value)

    # Also set root logger
    logging.getLogger().setLevel(level_value)


# Pre-configured logger for simple imports
logger = get_logger("pptx")

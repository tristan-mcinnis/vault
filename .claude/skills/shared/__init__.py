"""Shared utilities for pptx skills."""

from .result import Result, Issue, Severity, success, failure
from .logging_config import get_logger, setup_logging, set_log_level

__all__ = [
    "Result",
    "Issue",
    "Severity",
    "success",
    "failure",
    "get_logger",
    "setup_logging",
    "set_log_level",
]

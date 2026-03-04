"""Shared Result type for operations that can produce warnings and errors.

This module provides a generic Result type that tracks success/failure
along with detailed issues (warnings and errors) that occurred during
an operation.

Usage:
    from shared.result import Result, Severity

    def process_file(path: str) -> Result[dict]:
        result = Result()

        if not os.path.exists(path):
            result.add_error("FILE_NOT_FOUND", f"File not found: {path}")
            return result

        # Process file...
        result.add_warning("DEPRECATED", "Using deprecated format")
        result.value = processed_data
        return result

    # Check result
    r = process_file("data.json")
    if r.ok:
        print(f"Success with {len(r.warnings)} warnings")
    else:
        print(f"Failed: {r.errors}")
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, Generic, List, Optional, TypeVar


class Severity(Enum):
    """Issue severity levels."""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


@dataclass
class Issue:
    """A single issue (error/warning/info) from an operation.

    Attributes:
        severity: The issue severity level
        code: Machine-readable error code (e.g., "MISSING_IMAGE", "INVALID_HEX")
        message: Human-readable description
        location: Context path (e.g., "slide-0/element-2")
        suggestion: Actionable fix suggestion
        context: Additional data for debugging
    """
    severity: Severity
    code: str
    message: str
    location: str = ""
    suggestion: str = ""
    context: Dict[str, Any] = field(default_factory=dict)

    def __str__(self) -> str:
        parts = [f"[{self.severity.value.upper()}]", f"[{self.code}]", self.message]
        if self.location:
            parts.append(f"at {self.location}")
        if self.suggestion:
            parts.append(f"Suggestion: {self.suggestion}")
        return " ".join(parts)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "severity": self.severity.value,
            "code": self.code,
            "message": self.message,
            "location": self.location,
            "suggestion": self.suggestion,
            "context": self.context,
        }


T = TypeVar('T')


@dataclass
class Result(Generic[T]):
    """Result of an operation with optional value and issues.

    A Result is considered successful (ok=True) if it has no errors.
    Warnings do not affect success status.

    Attributes:
        value: The operation's return value (if successful)
        issues: List of issues encountered during operation
    """
    value: Optional[T] = None
    issues: List[Issue] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        """True if no errors (warnings are allowed)."""
        return not any(i.severity == Severity.ERROR for i in self.issues)

    @property
    def errors(self) -> List[Issue]:
        """Get all error-level issues."""
        return [i for i in self.issues if i.severity == Severity.ERROR]

    @property
    def warnings(self) -> List[Issue]:
        """Get all warning-level issues."""
        return [i for i in self.issues if i.severity == Severity.WARNING]

    @property
    def infos(self) -> List[Issue]:
        """Get all info-level issues."""
        return [i for i in self.issues if i.severity == Severity.INFO]

    def add_error(
        self,
        code: str,
        message: str,
        location: str = "",
        suggestion: str = "",
        **context: Any
    ) -> "Result[T]":
        """Add an error issue."""
        self.issues.append(Issue(
            severity=Severity.ERROR,
            code=code,
            message=message,
            location=location,
            suggestion=suggestion,
            context=context
        ))
        return self

    def add_warning(
        self,
        code: str,
        message: str,
        location: str = "",
        suggestion: str = "",
        **context: Any
    ) -> "Result[T]":
        """Add a warning issue."""
        self.issues.append(Issue(
            severity=Severity.WARNING,
            code=code,
            message=message,
            location=location,
            suggestion=suggestion,
            context=context
        ))
        return self

    def add_info(
        self,
        code: str,
        message: str,
        location: str = "",
        **context: Any
    ) -> "Result[T]":
        """Add an info issue."""
        self.issues.append(Issue(
            severity=Severity.INFO,
            code=code,
            message=message,
            location=location,
            context=context
        ))
        return self

    def merge(self, other: "Result") -> "Result[T]":
        """Merge another result's issues into this one."""
        self.issues.extend(other.issues)
        return self

    def format_issues(self, include_info: bool = False) -> str:
        """Format issues as human-readable string."""
        lines = []
        for issue in self.issues:
            if issue.severity == Severity.INFO and not include_info:
                continue
            lines.append(str(issue))
        return "\n".join(lines)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "ok": self.ok,
            "value": self.value,
            "issues": [i.to_dict() for i in self.issues],
            "error_count": len(self.errors),
            "warning_count": len(self.warnings),
        }


def success(value: T) -> Result[T]:
    """Create a successful result with a value."""
    return Result(value=value)


def failure(code: str, message: str, **kwargs: Any) -> Result[Any]:
    """Create a failed result with an error."""
    result: Result[Any] = Result()
    result.add_error(code, message, **kwargs)
    return result

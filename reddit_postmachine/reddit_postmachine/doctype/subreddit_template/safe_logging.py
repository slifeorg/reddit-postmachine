from __future__ import annotations

"""
Small logging helpers used by the v2 generator (`post_generator.py`).

These intentionally avoid calling `frappe.log_error` to prevent cascading failures
when the original exception context is more important.
"""


def log_error_safe(title: str, logs: list[str] | None, err: Exception):
    """Log error without raising secondary errors. Intentionally a no-op."""
    # We keep this as a no-op by design.
    return


def safe_log_append(logs: list[str] | None, message: object):
    """Safely append message to logs list."""
    try:
        if logs is not None and isinstance(logs, list):
            logs.append(str(message))
    except Exception:
        # Ignore any errors
        pass



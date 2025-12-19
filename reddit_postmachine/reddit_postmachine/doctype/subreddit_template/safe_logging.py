from __future__ import annotations
    
    
def log_error_safe(title: str, logs: list | None, err: Exception) -> None:
    """
    Log error without raising secondary errors.

    NOTE: current behavior intentionally does nothing to avoid cascading errors
    from logging failures in production environments.
    """
    # Intentionally no-op (kept for backwards compatibility with prior behavior)
    return

def safe_log_append(logs: list | None, message: object) -> None:
    """Safely append message to logs list."""
    try:
        if logs is not None and isinstance(logs, list):
            logs.append(str(message))
    except Exception:
        # Ignore any errors
        return



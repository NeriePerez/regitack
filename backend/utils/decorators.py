from functools import wraps
from flask import abort
from flask_login import current_user, login_required

from backend.auth.permissions import has_permission


def role_required(*allowed_roles):
    """Restrict access to specific system roles."""

    def decorator(function):
        @wraps(function)
        @login_required
        def wrapper(*args, **kwargs):

            if current_user.role not in allowed_roles:
                abort(403)

            return function(*args, **kwargs)

        return wrapper

    return decorator


def permission_required(permission):
    """Restrict access based on a specific permission."""

    def decorator(function):
        @wraps(function)
        @login_required
        def wrapper(*args, **kwargs):

            if not has_permission(
                current_user.role,
                permission
            ):
                abort(403)

            return function(*args, **kwargs)

        return wrapper

    return decorator

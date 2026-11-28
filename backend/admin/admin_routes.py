from flask import Blueprint, request, jsonify, render_template
from backend.auth.permissions import ROLE_PERMISSIONS
from flask_login import login_required, current_user

from backend.utils.decorators import permission_required

from backend.admin.admin_service import (
    get_users,
    get_role_names,
    create_user,
    update_user,
    reset_user_password,
    get_audit_logs,
    get_analytics_summary,
    get_system_settings,
    update_system_setting,
    get_audit_actions,
    get_admin_live_feed,
    get_report_data,
    get_all_requests
)


admin_bp = Blueprint(
    "admin",
    __name__,
    url_prefix="/admin"
)


def _actor_details():
    return (
        current_user.user_id,
        current_user.email,
        request.remote_addr
    )


@admin_bp.route("/api/users", methods=["GET"])
@login_required
@permission_required("manage_users")
def admin_users():
    search = request.args.get("search", "").strip()
    role = request.args.get("role", "").strip()
    status = request.args.get("status", "").strip()

    if role and role not in {"Student", "Registrar Staff", "Admin"}:
        return jsonify({"success": False, "message": "Invalid role filter."}), 400

    if status and status not in {"Active", "Inactive", "Locked"}:
        return jsonify({"success": False, "message": "Invalid status filter."}), 400

    users, error = get_users(search=search, role=role, status=status)

    if error:
        return jsonify({"success": False, "message": error}), 500

    return jsonify({"success": True, "users": users}), 200


@admin_bp.route("/api/roles", methods=["GET"])
@login_required
@permission_required("manage_roles")
def admin_roles():
    roles, error = get_role_names()

    if error:
        return jsonify({"success": False, "message": error}), 500

    return jsonify({"success": True, "roles": roles}), 200


@admin_bp.route("/api/users", methods=["POST"])
@login_required
@permission_required("manage_users")
def admin_create_user():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A JSON request body is required."
        }), 400

    actor_id, actor_email, ip_address = _actor_details()

    user, error = create_user(
        full_name=data.get("full_name"),
        email=data.get("email"),
        password=data.get("password"),
        role_name=data.get("role"),
        actor_id=actor_id,
        actor_email=actor_email,
        ip_address=ip_address
    )

    if error:
        return jsonify({"success": False, "message": error}), 400

    return jsonify({"success": True, "user": user}), 201


@admin_bp.route("/api/users/<int:user_id>", methods=["PUT"])
@login_required
@permission_required("manage_users")
def admin_update_user(user_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A JSON request body is required."
        }), 400

    actor_id, actor_email, ip_address = _actor_details()

    user, error = update_user(
        user_id=user_id,
        full_name=data.get("full_name"),
        email=data.get("email"),
        role_name=data.get("role"),
        account_status=data.get("account_status"),
        actor_id=actor_id,
        actor_email=actor_email,
        ip_address=ip_address
    )

    if error:
        return jsonify({"success": False, "message": error}), 400

    return jsonify({"success": True, "user": user}), 200


@admin_bp.route("/api/users/<int:user_id>/reset-password", methods=["POST"])
@login_required
@permission_required("manage_users")
def admin_reset_password(user_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A JSON request body is required."
        }), 400

    actor_id, actor_email, ip_address = _actor_details()

    success, error = reset_user_password(
        user_id=user_id,
        new_password=data.get("new_password"),
        actor_id=actor_id,
        actor_email=actor_email,
        ip_address=ip_address
    )

    if not success:
        return jsonify({"success": False, "message": error}), 400

    return jsonify({
        "success": True,
        "message": "User password was reset successfully."
    }), 200


@admin_bp.route("/api/analytics", methods=["GET"])
@login_required
@permission_required("view_reports")
def admin_analytics():
    result, error = get_analytics_summary()

    if error:
        return jsonify({"success": False, "message": error}), 500

    return jsonify({"success": True, "analytics": result}), 200



@admin_bp.route("/api/audit-logs", methods=["GET"])
@login_required
@permission_required("view_audit_logs")
def admin_audit_logs():
    search = request.args.get("search", "").strip()
    action = request.args.get("action", "").strip()

    try:
        limit = int(request.args.get("limit", 100))
    except ValueError:
        return jsonify({
            "success": False,
            "message": "Limit must be a whole number."
        }), 400

    logs, error = get_audit_logs(
            search=search,
            action=action,
            limit=limit
        )

    if error:
        return jsonify({"success": False, "message": error}), 500

    actions, error = get_audit_actions()

    if error:
        return jsonify({"success": False, "message": error}), 500

    return jsonify({
        "success": True,
        "logs": logs,
        "actions": actions
    }), 200


@admin_bp.route("/api/settings", methods=["GET"])
@login_required
@permission_required("manage_system_settings")
def admin_settings():
    settings, error = get_system_settings()

    if error:
        return jsonify({"success": False, "message": error}), 500

    return jsonify({"success": True, "settings": settings}), 200


@admin_bp.route("/api/settings/<string:setting_key>", methods=["PUT"])
@login_required
@permission_required("manage_system_settings")
def admin_update_setting(setting_key):
    data = request.get_json(silent=True)

    if not isinstance(data, dict) or "setting_value" not in data:
        return jsonify({
            "success": False,
            "message": "A setting_value is required."
        }), 400

    actor_id, actor_email, ip_address = _actor_details()

    success, error = update_system_setting(
        setting_key=setting_key,
        setting_value=data.get("setting_value"),
        actor_id=actor_id,
        actor_email=actor_email,
        ip_address=ip_address
    )

    if not success:
        return jsonify({"success": False, "message": error}), 400

    return jsonify({
        "success": True,
        "message": "System setting updated successfully."
    }), 200



# =========================================
# ADMIN WEB PAGES
# =========================================

@admin_bp.route("/dashboard", methods=["GET"])
@permission_required("view_reports")
def admin_analytics_page():
    return render_template(
        "admin/analytics.html",
        permissions=ROLE_PERMISSIONS.get(current_user.role, []),
        active_page="analytics"
    )


@admin_bp.route("/users", methods=["GET"])
@permission_required("manage_users")
def admin_users_page():
    return render_template(
        "admin/users.html",
        permissions=ROLE_PERMISSIONS.get(current_user.role, []),
        active_page="users"
    )


@admin_bp.route("/logs", methods=["GET"])
@permission_required("view_audit_logs")
def admin_logs_page():
    return render_template(
        "admin/logs.html",
        permissions=ROLE_PERMISSIONS.get(current_user.role, []),
        active_page="logs"
    )


@admin_bp.route("/settings", methods=["GET"])
@permission_required("manage_system_settings")
def admin_settings_page():
    return render_template(
        "admin/settings.html",
        permissions=ROLE_PERMISSIONS.get(current_user.role, []),
        active_page="settings"
    )





@admin_bp.route("/api/requests", methods=["GET"])
@login_required
@permission_required("view_reports")
def admin_all_requests():

    requests, error = get_all_requests()

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 500

    return jsonify({
        "success": True,
        "requests": requests
    }), 200



@admin_bp.route("/api/live-feed", methods=["GET"])
@login_required
@permission_required("view_reports")
def admin_live_feed():

    activities, error = get_admin_live_feed(limit=10)

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 500

    return jsonify({
        "success": True,
        "activities": activities
    }), 200


@admin_bp.route("/api/reports", methods=["GET"])
@login_required
@permission_required("view_reports")
def admin_reports():
    requests, error = get_report_data()

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 500

    return jsonify({
        "success": True,
        "requests": requests
    }), 200
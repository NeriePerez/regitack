
from flask import Blueprint, jsonify, render_template
from flask_login import login_required, current_user

from backend.registrar.registrar_service import (
    get_registrar_dashboard
)


registrar_bp = Blueprint(
    "registrar",
    __name__,
    url_prefix="/registrar"
)


@registrar_bp.route("/dashboard")
@login_required
def registrar_dashboard():
    return render_template("registrar/staff_main.html")


@registrar_bp.route("/api/dashboard", methods=["GET"])
@login_required
def registrar_dashboard_api():

    try:
        user_id = int(current_user.get_id())

        dashboard, error = get_registrar_dashboard(user_id)

        if error:
            return jsonify({
                "success": False,
                "message": error
            }), 403

        return jsonify({
            "success": True,
            **dashboard
        }), 200

    except Exception as error:
        print("Registrar dashboard route error:", error)

        return jsonify({
            "success": False,
            "message": "An error occurred while loading the dashboard."
        }), 500


@registrar_bp.route("/request_page")
@login_required
def registrar_request_page():
    return render_template("registrar/staff_request_page.html")

@registrar_bp.route("/request_list")
@login_required
def registrar_request_list():
    return render_template("registrar/staff_request_list.html")
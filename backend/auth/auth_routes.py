from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user

from backend.auth.auth_service import authenticate_user
from backend.auth.permissions import is_valid_role

from backend.auth.register_service import register_student

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "JSON request body is required."
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    user = authenticate_user(email, password)

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password, or account inactive."
        }), 401

    if not is_valid_role(user.role):
        return jsonify({
            "success": False,
            "message": "Account role is not recognized."
        }), 403

    # Prevent session reuse after login
    logout_user()

    login_user(user)

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "user": {
            "user_id": user.user_id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }), 200


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():

    logout_user()

    return jsonify({
        "success": True,
        "message": "Logout successful."
    }), 200


@auth_bp.route("/me", methods=["GET"])
@login_required
def current_session():

    return jsonify({
        "success": True,
        "user": {
            "user_id": current_user.user_id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        }
    }), 200


# =========================================
# STUDENT REGISTRATION API
# =========================================

@auth_bp.route("/api/register", methods=["POST"])
def register_api():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Invalid request data."
        }), 400

    full_name = data.get("full_name", "")
    student_number = data.get("student_id", "")
    program = data.get("program", "")
    year_level = data.get("year_level", "")
    email = data.get("email", "")
    password = data.get("password", "")

    account, error = register_student(
        full_name=full_name,
        student_number=student_number,
        program=program,
        year_level=year_level,
        email=email,
        password=password
    )

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 400

    return jsonify({
        "success": True,
        "message": "Account created successfully. You may now log in.",
        "account": {
            "full_name": account["full_name"],
            "email": account["email"]
        }
    }), 201
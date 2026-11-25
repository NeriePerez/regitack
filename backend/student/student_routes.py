from flask import Blueprint, jsonify, request, render_template
from flask_login import login_required, current_user

from backend.auth.permissions import STUDENT
from backend.utils.decorators import role_required

from backend.student.student_service import (
    get_student_dashboard,
    get_recent_requests,
    get_active_request,
    get_ready_request,
    get_dashboard_highlights
)

from backend.student.profile_service import (
    get_student_profile
)

from backend.student.student_request_service import (
    submit_document_request,
    get_student_requests,
    get_request_details
)

from backend.documents.document_service import (
    get_available_documents,
    get_document_by_id,
    get_document_requirements
)




student_bp = Blueprint(
    "student",
    __name__,
    url_prefix="/student"
)


# STUDENT DASHBOARD PAGE
@student_bp.route("/dashboard", methods=["GET"])
@login_required
@role_required(STUDENT)
def dashboard_page():

    return render_template(
        "student/dashboard.html"
    )


# DOCUMENT CATALOG PAGE
@student_bp.route("/documents", methods=["GET"])
@login_required
@role_required(STUDENT)
def documents_page():

    return render_template(
        "student/documents.html"
    )


# REQUEST FORM PAGE
@student_bp.route("/request/<int:document_id>", methods=["GET"])
@login_required
@role_required(STUDENT)
def request_page(document_id):

    document = get_document_by_id(document_id)

    if not document:
        return "Document not found.", 404

    requirements = get_document_requirements(document_id)

    return render_template(
        "student/request_form.html",
        document=document,
        requirements=requirements
    )


# MY REQUESTS PAGE
@student_bp.route("/my-requests", methods=["GET"])
@login_required
@role_required(STUDENT)
def my_requests_page():

    return render_template(
        "student/my_requests.html"
    )


# =========================================
# STUDENT DASHBOARD API
# =========================================

@student_bp.route("/api/dashboard", methods=["GET"])
@login_required
@role_required(STUDENT)
def dashboard_api():

    # Get the logged-in student's profile
    profile = get_student_profile(current_user.user_id)

    if not profile:
        return jsonify({
            "success": False,
            "message": "Student profile not found."
        }), 404

    # Get dashboard statistics
    statistics = get_student_dashboard(
        current_user.user_id
    )

    if statistics is None:
        return jsonify({
            "success": False,
            "message": "Unable to retrieve dashboard statistics."
        }), 500

    # Get recent requests
    recent_requests = get_recent_requests(
        current_user.user_id
    )

    if recent_requests is None:
        return jsonify({
            "success": False,
            "message": "Unable to retrieve recent requests."
        }), 500

    # Get active request
    active_request = get_active_request(
        current_user.user_id
    )

    # Get ready-for-pickup request
    ready_request = get_ready_request(
        current_user.user_id
    )

    # Return dashboard data
    return jsonify({
        "success": True,
        "student": profile,
        "statistics": statistics,

        "active_request": active_request,
        "ready_request": ready_request,

        "recent_requests": recent_requests

    }), 200



# STUDENT DOCUMENT CATALOG API
@student_bp.route("/api/documents", methods=["GET"])
@login_required
@role_required(STUDENT)
def documents_api():

    return jsonify({
        "success": True,
        "documents": get_available_documents()
    }), 200


# DOCUMENT REQUIREMENTS API
@student_bp.route(
    "/api/documents/<int:document_id>/requirements",
    methods=["GET"]
)
@login_required
@role_required(STUDENT)
def requirements_api(document_id):

    document = get_document_by_id(document_id)

    if not document:
        return jsonify({
            "success": False,
            "message": "Document not found."
        }), 404

    return jsonify({
        "success": True,
        "requirements": get_document_requirements(
            document_id
        )
    }), 200


# SUBMIT REQUEST API
@student_bp.route("/api/requests", methods=["POST"])
@login_required
@role_required(STUDENT)
def submit_request_api():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A JSON request body is required."
        }), 400

    result, error = submit_document_request(
        current_user.user_id,
        data
    )

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 400

    document_id = data.get("document_id")
    purpose = data.get("purpose", "")
    quantity = data.get("quantity", 1)

    if not document_id:
        return jsonify({
            "success": False,
            "message": "Document selection is required."
        }), 400

    try:
        document_id = int(document_id)
        quantity = int(quantity)

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid document ID or quantity."
        }), 400

    # =========================================
    # SUBMIT DOCUMENT REQUEST
    # =========================================

    result, error = submit_document_request(
        user_id=current_user.user_id,
        data={
            "document_id": document_id,
            "purpose": purpose,
            "quantity": quantity
        }
    )

    # =========================================
    # HANDLE SUBMISSION ERROR
    # =========================================

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 400

    if not result:
        return jsonify({
            "success": False,
            "message": "Failed to submit document request."
        }), 500

    # =========================================
    # RETURN SUCCESSFUL REQUEST DATA
    # =========================================

    return jsonify({
        "success": True,
        "message": "Document request submitted successfully.",
        "data": result
    }), 201


# MY REQUESTS API
# =========================================

@student_bp.route("/api/requests", methods=["GET"])
@login_required
@role_required(STUDENT)
def my_requests_api():

    # Retrieve all student requests
    requests_list = get_recent_requests(
        current_user.user_id,
        limit=100
    )

    if requests_list is None:
        return jsonify({
            "success": False,
            "message": "Unable to retrieve request history."
        }), 500

    # Retrieve request statistics
    statistics = get_student_dashboard(
        current_user.user_id
    )

    if statistics is None:
        return jsonify({
            "success": False,
            "message": "Unable to retrieve request statistics."
        }), 500

    return jsonify({
        "success": True,
        "statistics": statistics,
        "requests": requests_list
    }), 200



# REQUEST DETAILS API
@student_bp.route(
    "/api/requests/<int:request_id>",
    methods=["GET"]
)
@login_required
@role_required(STUDENT)
def request_details_api(request_id):

    request_data = get_request_details(
        current_user.user_id,
        request_id
    )

    if not request_data:
        return jsonify({
            "success": False,
            "message": "Request not found."
        }), 404

    return jsonify({
        "success": True,
        "request": request_data
    }), 200

# =========================================
# STUDENT PROFILE API
# =========================================

@student_bp.route("/api/profile", methods=["GET"])
@login_required
@role_required(STUDENT)
def student_profile_api():

    profile = get_student_profile(
        current_user.user_id
    )

    if not profile:
        return jsonify({
            "success": False,
            "message": "Student profile not found."
        }), 404

    return jsonify({
        "success": True,
        "profile": profile
    }), 200
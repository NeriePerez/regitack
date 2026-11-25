from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from backend.auth.permissions import REGISTRAR_STAFF
from backend.utils.decorators import role_required

from backend.requests.request_service import (
    get_request_by_id,
    update_request_status
)

from backend.requests.request_history_service import (
    get_request_status_history
)
from backend.requests.request_service import get_all_requests


request_bp = Blueprint(
    "requests",
    __name__,
    url_prefix="/requests"
)


@request_bp.route("/<int:request_id>", methods=["GET"])
@login_required
@role_required(REGISTRAR_STAFF)
def request_details(request_id):
    result = get_request_by_id(request_id)

    if not result:
        return jsonify({
            "success": False,
            "message": "Request not found."
        }), 404

    return jsonify({
        "success": True,
        "request": result
    }), 200


@request_bp.route(
    "/<int:request_id>/status",
    methods=["PATCH"]
)
@login_required
@role_required(REGISTRAR_STAFF)
def change_request_status(request_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A JSON request body is required."
        }), 400

    new_status = data.get("status")
    remarks = data.get("remarks")

    allowed_statuses = {
        "Under Review",
        "Processing",
        "Ready for Pickup",
        "Rejected",
        "Cancelled",
        "On Hold"
    }

    if new_status not in allowed_statuses:
        return jsonify({
            "success": False,
            "message": "Invalid or restricted request status."
        }), 400

    if remarks is not None:
        if not isinstance(remarks, str):
            return jsonify({
                "success": False,
                "message": "Remarks must be text."
            }), 400

        remarks = remarks.strip()

        if len(remarks) > 1000:
            return jsonify({
                "success": False,
                "message": "Remarks must not exceed 1000 characters."
            }), 400

    success, message = update_request_status(
        request_id=request_id,
        new_status=new_status,
        changed_by=current_user.user_id,
        remarks=remarks
    )

    if not success:
        return jsonify({
            "success": False,
            "message": message
        }), 400

    return jsonify({
        "success": True,
        "message": message
    }), 200


@request_bp.route(
    "/<int:request_id>/history",
    methods=["GET"]
)
@login_required
@role_required(REGISTRAR_STAFF)
def request_history(request_id):
    # Confirm the request exists before retrieving its history.
    result = get_request_by_id(request_id)

    if not result:
        return jsonify({
            "success": False,
            "message": "Request not found."
        }), 404

    history = get_request_status_history(request_id)

    if history is None:
        return jsonify({
            "success": False,
            "message": "Unable to retrieve request history."
        }), 500

    return jsonify({
        "success": True,
        "history": history
    }), 200





@request_bp.route("/", methods=["GET"])
@login_required
@role_required(REGISTRAR_STAFF)
def all_requests():
    search = request.args.get("search", "").strip()
    status = request.args.get("status", "").strip() or None

    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
    except ValueError:
        return jsonify({
            "success": False,
            "message": "Invalid pagination values."
        }), 400

    result = get_all_requests(
        search=search or None,
        status=status,
        page=page,
        per_page=per_page
    )

    if result is None:
        return jsonify({
            "success": False,
            "message": "Unable to retrieve requests."
        }), 500

    return jsonify({
        "success": True,
        **result
    }), 200

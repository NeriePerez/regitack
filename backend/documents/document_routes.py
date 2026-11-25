from flask import Blueprint, jsonify
from flask_login import login_required

from backend.auth.permissions import STUDENT
from backend.utils.decorators import role_required

from backend.documents.document_service import (
    get_available_documents,
    get_document_by_id,
    get_document_requirements
)


document_bp = Blueprint(
    "documents",
    __name__,
    url_prefix="/api/documents"
)


@document_bp.route("/", methods=["GET"])
@login_required
@role_required(STUDENT)
def catalog():

    documents = get_available_documents()

    return jsonify({
        "success": True,
        "documents": documents
    }), 200


@document_bp.route("/<int:document_id>", methods=["GET"])
@login_required
@role_required(STUDENT)
def document_details(document_id):

    document = get_document_by_id(document_id)

    if not document:
        return jsonify({
            "success": False,
            "message": "Document not found."
        }), 404

    requirements = get_document_requirements(document_id)

    return jsonify({
        "success": True,
        "document": document,
        "requirements": requirements
    }), 200

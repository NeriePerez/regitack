# Available system roles
STUDENT = "Student"
REGISTRAR_STAFF = "Registrar Staff"
ADMIN = "Admin"


# Define roles
VALID_ROLES = [
    STUDENT,
    REGISTRAR_STAFF,
    ADMIN
]


# Role permission mapping
ROLE_PERMISSIONS = {
    STUDENT: [
        "view_documents",
        "submit_request",
        "view_own_requests",
        "cancel_own_request",
        "view_notifications",
        "view_own_profile",
        "manage_own_profile"
    ],

    REGISTRAR_STAFF: [
        "view_requests",
        "review_requests",
        "process_requests",
        "approve_requests",
        "reject_requests",
        "mark_ready",
        "verify_qr",
        "release_documents",
        "view_claim_records"
    ],

    ADMIN: [
        "manage_users",
        "manage_roles",
        "manage_documents",
        "manage_fees",
        "manage_requirements",
        "view_all_requests",
        "manage_system_settings",
        "view_reports",
        "view_audit_logs",
        "manage_notifications"
    ]
}


def has_permission(role, permission):
    """Check whether a role has a specific permission."""
    return permission in ROLE_PERMISSIONS.get(role, [])


def get_role_permissions(role):
    """Return all permissions assigned to a role."""
    return ROLE_PERMISSIONS.get(role, [])


def is_valid_role(role):
    """Check whether the role is recognized by the system."""
    return role in VALID_ROLES

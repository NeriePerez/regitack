ALLOWED_TRANSITIONS = {
    "Submitted": [
        "Under Review",
        "Rejected",
        "Cancelled",
        "On Hold"
    ],
    "Under Review": [
        "Processing",
        "Rejected",
        "Cancelled",
        "On Hold"
    ],
    "Processing": [
        "Ready for Pickup",
        "Rejected",
        "On Hold"
    ],
    "Ready for Pickup": [
        "On Hold"
    ],
    "On Hold": [
        "Under Review",
        "Processing",
        "Ready for Pickup",
        "Rejected",
        "Cancelled"
    ],
    "Released": [],
    "Rejected": [],
    "Cancelled": []
}


def validate_status_transition(current_status, new_status):
    if new_status == "Released":
        return False, (
            "Requests can only be marked Released "
            "after successful QR verification and claiming."
        )

    allowed = ALLOWED_TRANSITIONS.get(current_status, [])

    if new_status not in allowed:
        return False, (
            f"Status cannot be changed from "
            f"{current_status} to {new_status}."
        )

    return True, "Status transition is valid."

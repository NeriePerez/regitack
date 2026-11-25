from backend.student.student_service import get_student_by_user_id


def get_student_profile(user_id):
    return get_student_by_user_id(user_id)


import secrets
import string


REFERENCE_PREFIX = "RG"
REFERENCE_LENGTH = 6
REFERENCE_CHARACTERS = string.ascii_uppercase + string.digits


def generate_reference_number():
    random_part = "".join(
        secrets.choice(REFERENCE_CHARACTERS)
        for _ in range(REFERENCE_LENGTH)
    )

    return f"{REFERENCE_PREFIX}-{random_part}"

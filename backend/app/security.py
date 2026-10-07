"""Небольшие функции безопасности для работы с паролями."""

import hashlib
import os


def hash_password(password: str) -> str:
    """Создаёт соль и необратимый PBKDF2-хеш пароля."""
    salt = os.urandom(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt, 200_000
    )
    return f"{salt.hex()}:{password_hash.hex()}"

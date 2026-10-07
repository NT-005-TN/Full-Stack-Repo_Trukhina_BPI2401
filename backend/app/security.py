"""Хеширование паролей и создание подписанных токенов."""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import time
from base64 import urlsafe_b64decode, urlsafe_b64encode
from secrets import token_urlsafe

from .config import settings


def hash_password(password: str) -> str:
    """Создаёт соль и необратимый PBKDF2-хеш пароля."""
    salt = os.urandom(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt, 200_000
    )
    return f"{salt.hex()}:{password_hash.hex()}"


def verify_password(password: str, saved_hash: str) -> bool:
    """Безопасно сравнивает пароль с сохранённым хешем."""
    try:
        salt_hex, expected_hex = saved_hash.split(":", 1)
        actual = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt_hex), 200_000
        )
        return hmac.compare_digest(actual.hex(), expected_hex)
    except (ValueError, TypeError):
        return False


def _base64(data: bytes) -> str:
    """Кодирует часть JWT в URL-безопасный Base64 без заполнения."""
    return urlsafe_b64encode(data).rstrip(b"=").decode()


def create_access_token(user_id: int) -> str:
    """Создаёт подписанный access token с владельцем и сроком действия."""
    header = _base64(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload = _base64(json.dumps({
        "sub": str(user_id),
        "exp": int(time.time()) + settings.access_token_minutes * 60,
    }).encode())
    message = f"{header}.{payload}"
    signature = hmac.new(
        settings.jwt_secret.encode(), message.encode(), hashlib.sha256
    ).digest()
    return f"{message}.{_base64(signature)}"


def read_access_token(token: str) -> int | None:
    """Проверяет подпись и срок JWT, затем возвращает ID пользователя."""
    try:
        header, payload, signature = token.split(".")
        message = f"{header}.{payload}"
        expected = hmac.new(
            settings.jwt_secret.encode(), message.encode(), hashlib.sha256
        ).digest()
        padding = "=" * (-len(signature) % 4)
        if not hmac.compare_digest(urlsafe_b64decode(signature + padding), expected):
            return None
        payload_padding = "=" * (-len(payload) % 4)
        data = json.loads(urlsafe_b64decode(payload + payload_padding))
        if int(data["exp"]) <= int(time.time()):
            return None
        return int(data["sub"])
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        return None


def create_refresh_token() -> str:
    """Генерирует случайный секретный refresh token."""
    return token_urlsafe(48)


def hash_token(token: str) -> str:
    """Хеширует refresh token перед сохранением в базе."""
    return hashlib.sha256(token.encode()).hexdigest()

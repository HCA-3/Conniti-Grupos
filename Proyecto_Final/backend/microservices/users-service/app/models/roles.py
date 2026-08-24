from enum import Enum


class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    CONTENT_MANAGER = "CONTENT_MANAGER"
    VIEWER = "VIEWER"
    DOCENTE = "DOCENTE"
    ESTUDIANTE = "ESTUDIANTE"
    EXTERNO = "EXTERNO"
    USER = "USER"

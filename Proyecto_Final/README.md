# CONIITI — Congreso Internacional de Ingeniería en Tecnologías de la Información

Plataforma web integral para la gestión y participación en el Congreso Internacional CONIITI. Desarrollada con arquitectura de microservicios, sistema de roles Grupo 1, personalización dinámica de la interfaz y soporte completo de sedes multimedia.

---

## 📋 Tabla de contenidos

1. [Descripción general](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Microservicios](#microservicios)
4. [Sistema de roles (Grupo 1)](#sistema-de-roles-grupo-1)
5. [Requisitos previos](#requisitos-previos)
6. [Instalación y arranque](#instalación-y-arranque)
7. [Variables de entorno](#variables-de-entorno)
8. [Sedes y videos Cómo llegar](#sedes-y-videos-cómo-llegar)
9. [Personalización del sitio](#personalización-del-sitio)
10. [Servicios y puertos](#servicios-y-puertos)
11. [Estructura del proyecto](#estructura-del-proyecto)
12. [Desarrollo local](#desarrollo-local-sin-docker)
13. [Comandos útiles](#comandos-útiles)

---

## Descripción general

CONIITI es una plataforma de gestión de congresos que permite:

- **Registro e inicio de sesión** con verificación OTP por correo
- **Agenda dinámica** con sesiones, sedes y conferencistas
- **Gestión de grupos de investigación** con miembros y administradores
- **Sistema de rifas** y premios
- **Gestión de archivos y multimedia** (imágenes, videos, documentos)
- **Panel de superusuario** con personalización completa del sitio
- **Videos de cómo llegar** a cada sede integrados en el modal de sedes (YouTube embed)
- **Roles administrativos** basados en el sistema Grupo 1

---

## Arquitectura

```
Browser
  └──► Nginx (puerto 80)
         ├─ /api/auth/*    → auth-service:8000
         ├─ /api/users/*   → users-service:8000
         ├─ /api/agenda/*  → agenda-service:8000
         ├─ /api/files/*   → files-service:8000
         ├─ /api/raffles/* → raffles-service:8000
         └─ /*             → React SPA (frontend)

Infraestructura compartida:
  PostgreSQL (shared-db)    ← todos los microservicios
  MongoDB (analytics-mongo) ← analytics-service
  RabbitMQ (shared-rabbitmq) ← mensajería asíncrona
```

---

## Microservicios

| Servicio | Descripción | Puerto interno |
|----------|-------------|---------------|
| `auth-service` | Autenticación, OTP, OAuth (Google/Microsoft), JWT | 8000 |
| `users-service` | Perfiles, roles, gestión de usuarios | 8000 |
| `agenda-service` | Sesiones, sedes, conferencistas, asistencia | 8000 |
| `files-service` | Subida y gestión de archivos multimedia | 8000 |
| `raffles-service` | Sistema de rifas y premios | 8000 |
| `notifications-service` | Envío de correos y notificaciones | 8000 |
| `payments-service` | Pasarela de pagos (modo mock disponible) | 8000 |
| `analytics-service` | Estadísticas y métricas del congreso | 8000 |
| `frontend` | Aplicación React + Vite servida por Nginx | 80 |

---

## Sistema de roles (Grupo 1)

La plataforma usa el sistema de roles estándar del **Grupo 1** (valores en MAYÚSCULAS):

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `SUPER_ADMIN` | Superadministrador del sistema | Panel `/superusuario` completo |
| `ADMIN` | Administrador del congreso | Panel `/staff` con gestión completa |
| `CONTENT_MANAGER` | Gestor de contenido | Panel `/staff` con edición de contenido |
| `VIEWER` | Visualizador de solo lectura | Panel `/staff` limitado |
| `DOCENTE` | Docente o profesor registrado | Funciones de participante |
| `ESTUDIANTE` | Estudiante de la comunidad universitaria | Funciones de participante |
| `EXTERNO` | Profesional externo (rol predeterminado) | Funciones de participante |
| `USER` | Usuario general | Funciones básicas |

> **Nota de compatibilidad**: Los roles legacy `superuser` y `staff` siguen siendo reconocidos por el frontend para compatibilidad con datos existentes.

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) >= 24
- Docker Compose V2 (incluido en Docker Desktop)
- 4 GB de RAM libres mínimo recomendado

---

## Instalación y arranque

```powershell
# 1. Entrar al directorio del proyecto
cd Proyecto_Final

# 2. Copiar y ajustar variables de entorno
Copy-Item infraestructura\.env infraestructura\.env.local
# Editar infraestructura\.env con credenciales reales

# 3. Construir y levantar todos los servicios
docker compose -f infraestructura/docker-compose.yml up -d --build

# 4. Verificar que todos los contenedores estén healthy
docker compose -f infraestructura/docker-compose.yml ps

# 5. Abrir la aplicación
start http://localhost
```

> **Primera ejecución**: Las migraciones de base de datos se aplican automáticamente en el arranque de cada servicio (Alembic).

---

## Variables de entorno

El archivo `infraestructura/.env` controla toda la configuración. Las variables críticas son:

| Variable | Descripción |
|----------|-------------|
| `POSTGRES_USER` | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL |
| `JWT_SECRET_KEY` | Clave secreta para tokens JWT (>= 32 caracteres) |
| `INTERNAL_SERVICE_TOKEN` | Token para comunicación entre microservicios |
| `SMTP_HOST` / `SMTP_USER` | Configuración de correo para OTP |
| `PAYMENT_PROVIDER_MODE` | `mock` para desarrollo, `live` para producción |
| `GOOGLE_CLIENT_ID` | Credenciales OAuth Google (opcional) |
| `MICROSOFT_CLIENT_ID` | Credenciales OAuth Microsoft (opcional) |

---

## Sedes y videos Cómo llegar

Cada sede puede tener recursos multimedia (imágenes, videos, documentos, enlaces) gestionados desde el panel de administración. El sistema soporta **YouTube embed automático**.

### Agregar un video de "Cómo llegar"

1. Inicia sesión como `SUPER_ADMIN` o `ADMIN`
2. Ve a **Panel → Sedes y Videos** (StaffDashboard, pestaña "Sedes y videos")
3. Selecciona la sede
4. Haz clic en **+ Nuevo recurso**
5. Tipo: `video`; en **URL externa** pega el enlace de YouTube
6. El sistema detecta automáticamente URLs de YouTube y las embebe como `<iframe>` responsive 16:9

### Formatos de URL de YouTube aceptados

| Formato | Ejemplo |
|---------|---------|
| Watch URL | `https://www.youtube.com/watch?v=XXXX` |
| Short URL | `https://youtu.be/XXXX` |
| Embed URL | `https://www.youtube.com/embed/XXXX` |

> Los videos hospedados directamente (MP4, WebM) también son compatibles cuando se suben desde el gestor de archivos.

### Sedes preconfiguradas

| Sede | Capacidad |
|------|-----------|
| Auditorio Paraninfo | 100 |
| Auditorio Torres | 100 |
| Auditorio Sede 4 - Sala 1 | 30 |
| Auditorio Sede 4 - Sala 2 | 30 |
| Auditorio Sede 4 - Sala 3 | 30 |
| Auditorio Sede 4 - Sala 4 | 30 |
| Auditorio Sede 4 - Sala 5 | 30 |
| Auditorio Sede 4 - Sala 6 | 30 |
| Virtual / Sala Principal | 500 |

---

## Personalización del sitio

Disponible desde el panel de superusuario en la pestaña **Personalización** (`Grupo1PersonalizationPanel`):

- **Paleta de colores**: fondo, primario, secundario, acento, texto
- **Logo y banner**: subida de imagen o URL externa
- **Temas predefinidos**: azul institucional, verde tecnológico, etc.
- **Capacidades de auditorios**: gestión de aforo por sede

Los cambios se aplican en tiempo real mediante `localStorage` y se propagan a todos los componentes vía el evento `site-config-updated`.

---

## Servicios y puertos

| Contenedor | Puerto expuesto | URL |
|------------|----------------|-----|
| `frontend` + Nginx | 80 | http://localhost |
| `shared-db` | 5432 | localhost:5432 |
| `analytics-mongo` | 27017 | localhost:27017 |
| `shared-rabbitmq` | 5672 / 15672 | localhost:15672 (admin) |

---

## Estructura del proyecto

```
Proyecto_Final/
├── README.md                          <- Este archivo
├── backend/
│   └── microservices/
│       ├── auth-service/              # FastAPI – autenticación y OAuth
│       ├── users-service/             # FastAPI – usuarios, perfiles, roles Grupo 1
│       ├── agenda-service/            # FastAPI – agenda, sedes, sesiones
│       ├── files-service/             # FastAPI – gestión de archivos
│       ├── raffles-service/           # FastAPI – rifas
│       ├── notifications-service/
│       ├── payments-service/
│       └── analytics-service/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── admin/
│       │   │   ├── Grupo1PersonalizationPanel.jsx  <- personalización del sitio
│       │   │   ├── UserAdminPanel.jsx              <- gestión de usuarios con roles G1
│       │   │   └── VenueManager.jsx                <- gestión de sedes y recursos
│       │   └── VenueMediaModal.jsx                 <- modal multimedia con YouTube embed
│       ├── pages/
│       │   ├── SuperuserDashboard.jsx  <- panel SUPER_ADMIN (incluye personalización G1)
│       │   ├── StaffDashboard.jsx      <- panel ADMIN/CONTENT_MANAGER/VIEWER
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   └── Register.jsx            <- selector de roles G1 (ESTUDIANTE/DOCENTE/EXTERNO/USER)
│       ├── services/
│       │   └── authService.js          <- normalización de roles a UPPERCASE (G1)
│       └── context/
│           └── EventThemeContext.jsx   <- variables CSS dinámicas de personalización
└── infraestructura/
    ├── docker-compose.yml
    ├── .env                            <- ⚠️ No subir al repositorio
    └── nginx/
```

---

## Desarrollo local (sin Docker)

### Frontend

```powershell
cd frontend
npm install
npm run dev
# Disponible en http://localhost:5173
```

### Backend (ejemplo: agenda-service)

```powershell
cd backend/microservices/agenda-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

---

## Comandos útiles

```powershell
# Ver logs de un servicio específico
docker compose -f infraestructura/docker-compose.yml logs -f frontend

# Reconstruir un servicio sin afectar los demás
docker compose -f infraestructura/docker-compose.yml build users-service
docker compose -f infraestructura/docker-compose.yml up -d users-service

# Acceder a la base de datos directamente
docker exec shared-db psql -U admin -d agenda_db

# Acceder a la consola del admin de RabbitMQ
start http://localhost:15672

# Detener todos los servicios
docker compose -f infraestructura/docker-compose.yml down

# Detener y eliminar volúmenes (ADVERTENCIA: borra la base de datos)
docker compose -f infraestructura/docker-compose.yml down -v
```

---

## Notas de integración Grupo 1

Este proyecto incorpora los estándares del **Grupo 1** de CONIITI:

- **Roles**: sistema UPPERCASE (`SUPER_ADMIN`, `ADMIN`, `CONTENT_MANAGER`, `VIEWER`, `DOCENTE`, `ESTUDIANTE`, `EXTERNO`, `USER`)
- **Sedes**: Auditorio Paraninfo, Auditorio Torres, Sedes 4 (Salas 1–6), Virtual/Sala Principal
- **Videos de acceso**: soporte de YouTube embed automático en el modal de sedes
- **Personalización**: paleta de colores, logo, banner y capacidades gestionables desde el panel del superadministrador

---

*Generado para CONIITI — Proyecto Final Integrador*

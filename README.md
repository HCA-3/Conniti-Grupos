# CONIITI — Congreso Internacional de Ingeniería

Plataforma web integral para la gestión y participación en el Congreso Internacional CONIITI. Desarrollada con arquitectura de microservicios, sistema de roles, personalización dinámica de la interfaz y soporte completo de sedes multimedia.

---

## 📋 Tabla de contenidos

1. [Descripción general](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Microservicios](#microservicios)
4. [Sistema de roles](#sistema-de-roles)
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
- **Roles administrativos** con permisos diferenciados

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

## Sistema de roles

La plataforma usa los siguientes roles canónicos (valores en MAYÚSCULAS):

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `SUPER_ADMIN` | Control total del sistema | Todo el panel y gestión de cuentas administrativas |
| `ADMIN` | Operación integral del congreso | Contenido, agenda, archivos, grupos, rifas y participantes; no crea administradores |
| `PARTICIPANT` | Persona registrada en el congreso | Perfil y funciones personales de participación |

Las personas que solo consultan contenido público no tienen rol: navegan como visitantes anónimos. Los valores anteriores se convierten automáticamente mediante la migración de `users-service`.

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) >= 24
- Docker Compose V2 (incluido en Docker Desktop)
- 4 GB de RAM libres mínimo recomendado

---

## Instalación y arranque

```powershell
# 1. Opcional: crear un archivo de configuración personalizada
Copy-Item infraestructura\.env.example infraestructura\.env
# El arranque local también funciona sin este archivo, usando valores predeterminados.

# 2. Construir y levantar todos los servicios desde la raíz
docker compose up --build

# 3. Verificar que todos los contenedores estén healthy
docker compose ps

# 4. Abrir la aplicación
start http://localhost
```

> **Primera ejecución**: las migraciones de base de datos y los datos locales de demostración se aplican automáticamente. Las semillas son idempotentes: los siguientes arranques no duplican registros ni sobrescriben cambios existentes.

### Usuarios de demostración

| Rol | Correo | Contraseña |
|-----|--------|------------|
| `SUPER_ADMIN` | `admin@coniiti.dev` | `AdminConiiti2026!` |
| `PARTICIPANT` | `participante@coniiti.dev` | `Participante2026!` |

El superadministrador puede solicitar un código OTP al iniciar sesión. Sin SMTP configurado, el entorno local devuelve/habilita el código de desarrollo en el flujo de autenticación. Estas credenciales son exclusivamente para desarrollo y se pueden cambiar en `infraestructura/.env`.

Además se crean un grupo con dos integrantes, dos miembros del comité, tres sedes, tres conferencistas, tres actividades de agenda, tres tarjetas de contenido y una rifa en borrador.

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
| `DEMO_SEED_ENABLED` | Crea datos reproducibles de desarrollo (`true` por defecto en Compose) |
| `DEMO_SUPER_ADMIN_*` | Correo y contraseña iniciales del superadministrador local |
| `DEMO_PARTICIPANT_*` | Correo y contraseña iniciales del participante local |
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

Disponible desde el panel de superusuario en la pestaña **Personalización** (`SitePersonalizationPanel`):

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
./
├── README.md                          <- Este archivo
├── backend/
│   └── microservices/
│       ├── auth-service/              # FastAPI – autenticación y OAuth
│       ├── users-service/             # FastAPI – usuarios, perfiles y roles
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
│       │   │   ├── SitePersonalizationPanel.jsx    <- personalización del sitio
│       │   │   ├── UserAdminPanel.jsx              <- gestión de usuarios con roles G1
│       │   │   └── VenueManager.jsx                <- gestión de sedes y recursos
│       │   └── VenueMediaModal.jsx                 <- modal multimedia con YouTube embed
│       ├── pages/
│       │   ├── SuperuserDashboard.jsx  <- centro de gestión; cuentas administrativas solo para SUPER_ADMIN
│       │   ├── StaffDashboard.jsx      <- operación para SUPER_ADMIN/ADMIN
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   └── Register.jsx            <- registro de PARTICIPANT
│       ├── services/
│       │   └── authService.js          <- normalización de roles a UPPERCASE (G1)
│       └── context/
│           └── EventThemeContext.jsx   <- variables CSS dinámicas de personalización
└── infraestructura/
    ├── docker-compose.yml
    ├── .env.example                    # Plantilla sin secretos
    ├── docker-compose.yml
    ├── traefik/
    ├── prometheus/
    ├── grafana/
    └── Kubernetes/
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
docker compose logs -f frontend

# Reconstruir un servicio sin afectar los demás
docker compose build users-service
docker compose up -d users-service

# Acceder a la base de datos directamente
docker exec shared-db psql -U admin -d agenda_db

# Acceder a la consola del admin de RabbitMQ
start http://localhost:15672

# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (ADVERTENCIA: borra la base de datos)
docker compose down -v
```

### Persistencia y datos reproducibles

`docker compose down` conserva los volúmenes, por lo que las modificaciones hechas desde la aplicación o PostgreSQL siguen disponibles en el siguiente arranque. `docker compose down -v` sí elimina todos los datos locales.

Git no guarda los volúmenes de PostgreSQL. En su lugar, el repositorio guarda una semilla por microservicio; después de clonar, `docker compose up --build` reconstruye el conjunto de demostración dentro de la base correspondiente:

| Base | Propietario | Datos iniciales |
|------|-------------|-----------------|
| `authdb` | `auth-service` | Credenciales de las dos cuentas demo |
| `usersdb` | `users-service` | Perfiles, roles, grupo y comité |
| `agenda_db` | `agenda-service` | Configuración, sedes, conferencistas y sesiones |
| `filesdb` | `files-service` | Memorias, galería y convocatoria de autores |
| `rafflesdb` | `raffles-service` | Rifa de demostración en borrador |

Para arrancar sin insertar demostraciones, defina `DEMO_SEED_ENABLED=false` en `infraestructura/.env`.

### Snapshot temporal completo en Git

Durante la etapa de pruebas, el repositorio puede guardar una copia completa de las siete bases PostgreSQL y de MongoDB. Ejecute manualmente:

```powershell
.\infraestructura\scripts\snapshot-databases.ps1
git add infraestructura/database-snapshots
git commit -m "Actualizar snapshot de bases de datos"
git push
```

El hook versionado `.githooks/pre-commit` también actualiza y agrega automáticamente los snapshots antes de cada commit. Para activarlo una vez después de clonar:

```powershell
git config core.hooksPath .githooks
```

Cuando el proyecto se levanta con volúmenes nuevos, PostgreSQL y MongoDB restauran esos snapshots automáticamente. En un volumen existente no se fuerza la restauración para no sobrescribir cambios locales.

> **Advertencia temporal:** estos archivos contienen la base completa, incluyendo correos, hashes de contraseña, OTP, pagos y demás información almacenada. El repositorio debe ser privado. Antes de publicar o pasar a producción hay que eliminar `infraestructura/database-snapshots`, desactivar el hook y retirar los montajes de restauración de Compose.

---

## Funcionalidad integrada

La plataforma incorpora:

- **Roles**: sistema canónico (`SUPER_ADMIN`, `ADMIN`, `PARTICIPANT`)
- **Sedes**: Auditorio Paraninfo, Auditorio Torres, Sede 4, Virtual/Sala Principal
- **Videos de acceso**: soporte de YouTube embed automático en el modal de sedes
- **Personalización**: paleta de colores, logo, banner y capacidades gestionables desde el panel del superadministrador

---

*Generado para CONIITI — Proyecto Final Integrador*

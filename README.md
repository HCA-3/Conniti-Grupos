# CONIITI 2026 - Repositorio de Grupos

Este repositorio centraliza los proyectos desarrollados para la gestión del **Congreso Internacional de Innovación y Tendencias en Ingeniería (CONIITI) 2026** de la **Universidad Católica de Colombia**.

## 🏗️ Estructura del Proyecto

El repositorio contiene dos enfoques de implementación distintos:

### 📁 [Grupo 1](./Grupo%201/proyectoProduccion) - Enfoque Monolítico
Una solución ágil ideal para prototipado rápido y despliegues sencillos.
- **Arquitectura:** Monolito
- **Frontend:** React + TypeScript + Vite
- **Backend:** Express + Node.js
- **Base de Datos:** Supabase (PostgreSQL gestionado)
- **Despliegue:** Render.com

### 📁 [Grupo 2](./Grupo%202/CONIITI) - Enfoque Microservicios Empresarial
Una solución robusta, escalable y lista para producción a gran escala con monitoreo completo.
- **Arquitectura:** 8 Microservicios independientes
- **Frontend:** React + Vite
- **Backend:** FastAPI (Python)
- **Base de Datos:** PostgreSQL (7 BDs) + MongoDB
- **Mensajería:** RabbitMQ
- **Infraestructura & Observabilidad:** Docker Compose, Kubernetes, Traefik, Prometheus, Grafana

## 🔄 Notas de Estandarización
Se está llevando a cabo un proceso de estandarización progresiva para unificar la nomenclatura del **Grupo 1** (originalmente en español) hacia el estándar en inglés definido por el **Grupo 2**, garantizando consistencia en las APIs:
- `ponencia` → `session`
- `ponente` → `speaker`
- `inscripcion` → `attendance`
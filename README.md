# 🛡️ VacunaGuard AI

**Sistema de coordinación logística de brigadas de salud y vacunación.**

Plataforma basada en microservicios con Arquitectura Hexagonal (puertos y adaptadores) para el registro de ciudadanos y dosis en campo, la optimización geográfica de rutas de brigadas, el control de la red de frío de vacunas con monitoreo IoT y un consultor de protocolos de vacunación con IA generativa (RAG).

---

## 🧩 Componentes

### Microservicios (Node.js · NestJS 12 · TypeScript)

| Servicio | Puerto | Base de datos | Responsabilidad |
|---|---|---|---|
| **identity-service** | 3001 | PostgreSQL (identity_db) | Autenticación JWT, roles (ADMINISTRADOR / COORDINADOR / BRIGADISTA) y alta de usuarios |
| **cold-chain-service** | 3002 | PostgreSQL (coldchain_db) | Lotes de vacunas, stock, lecturas de temperatura de hieleras (2–8 °C) y eventos de dominio |
| **registry-service** | 3003 | PostgreSQL (registry_db) | Registro de ciudadanos (CURP cifrada AES-256-GCM) y aplicación de dosis |
| **routes-service** | 3004 | PostgreSQL + **PostGIS** (routes_db) | Puntos de visita, optimización de rutas (vecino más cercano), GPS en tiempo real (WebSocket) y alertas de stock |
| **advisor-service** | 3005 | PostgreSQL + **pgvector** (advisor_db) | Consultor RAG de protocolos de vacunación con **Ollama** (embeddings nomic-embed-text, LLM llama3.2:3b) |

### Infraestructura (Docker Compose)

- **RabbitMQ** — bus de eventos (vacuna.aplicada, stock.bajo, temperatura.critica)
- **6 bases PostgreSQL** (una por servicio + n8n) · **n8n** (automatización → alertas por **Telegram**) · **Node-RED** (simulador IoT de 5 hieleras) · **Ollama** (LLM local)

### Aplicación móvil (React Native · Expo · TypeScript)

- 10 pantallas: acceso, panel, alta de ciudadano, aplicar vacuna, ruta, red de frío, consultor IA, GPS en vivo, nuevo lote y nuevo brigadista.
- **Offline-first**: cola local SQLite, sincronización automática, mapa y ruta guardados sin conexión.

---

## ✅ Requisitos previos

- Windows 10/11 con **WSL2** (Ubuntu) y **Docker Desktop**
- **Node.js 24** en WSL (recomendado vía nvm) y en Windows (para la app móvil)
- **Expo Go** en el celular (misma red Wi-Fi que la PC) y una **cuenta de Expo** (gratuita) para desarrollo
- Git

---

## 🚀 Instalación

### 1. Clonar e instalar dependencias (dentro de WSL)

    cd ~/vacunaguard
    export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
    for s in services/*/; do (cd "$s" && npm install); done

### 2. Levantar la infraestructura (Docker)

    cd ~/vacunaguard
    docker compose up -d

Esto arranca RabbitMQ, las 6 bases PostgreSQL, n8n, Node-RED y Ollama (verifica con: docker ps). Todos escuchan en 127.0.0.1.

### 3. Configuración (.env)

Cada servicio tiene su propio .env (services/<servicio>/.env) con credenciales locales. **No se versionan** (ver .gitignore). Revisa que coincidan con las variables del .env raíz usado por Docker Compose.

### 4. Compilar y probar

    for s in services/*/; do (cd "$s" && npm run build && npm test); done

### 5. Arranque de la demo (un solo comando, desde Windows)

    powershell -ExecutionPolicy Bypass -File scriptsiniciar-demo.ps1

Este script levanta: los 5 servicios (en WSL), el puente de puertos Windows→WSL (para que el celular alcance el backend) y Metro (servidor de la app móvil). Para detener todo: scriptsdetener-demo.ps1.

---

## 📱 Aplicación móvil (desarrollo con Expo Go)

    cd mobile
    npm install
    npx expo login        (una sola vez, con la cuenta de Expo)
    npx expo start        (imprime el QR / URL)

- En el celular: abrir **Expo Go** → *Enter URL manually* → exp://<IP-DE-LA-PC>:8081
- La app detecta la IP de la PC automáticamente; el puente expone los puertos 3001–3005 en la LAN.

---

## 👥 Cuentas de demostración

El servicio de identidad crea estas cuentas automáticamente al arrancar (además del administrador del .env):

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | (ADMIN_EMAIL de identity-service/.env) | (ADMIN_PASSWORD) |
| Coordinador | coordinador@salud.gob.mx | Coordina2026 |
| Brigadista | ana@salud.gob.mx | Segura2026 |

**Reglas por rol:** el administrador supervisa y da de alta usuarios/lotes (no aplica vacunas); el coordinador asigna rutas y monitorea la red de frío; el brigadista registra ciudadanos y aplica dosis.

---

## 🧠 IA: consultor de protocolos (RAG)

- **Corpus**: PRONAM 2026 (DOF), Manual de Vacunación 2021, Manual ESAVI 2026, Cartilla Nacional de Salud 2023, resumen de red de frío y esquema curado del proyecto (1,234 fragmentos indexados en pgvector).
- **Ingesta**: cd services/advisor-service && npm run ingesta (trocea los documentos, genera embeddings con Ollama y los guarda en pgvector).
- **Consulta**: POST /consultas → respuesta con citas [documento (año), p. X].

---

## 🧱 Arquitectura

Cada microservicio sigue DDD + Arquitectura Hexagonal:

    src/
    ├── domain/           # Entidades, value objects, excepciones (núcleo puro)
    ├── application/      # Casos de uso, puertos (interfaces) y DTOs
    └── infrastructure/   # Adaptadores: HTTP, PostgreSQL/PostGIS/pgvector, RabbitMQ, Ollama, WebSocket

El enunciado del proyecto define 3 microservicios de negocio (Routes, Cold Chain, Registry); este proyecto añade dos servicios transversales coherentes con la arquitectura: **identity** (autenticación y roles, necesarios para el trabajo en campo) y **advisor** (hogar del componente RAG+LLM).

---

## 🔒 Seguridad

- Autenticación JWT con roles y guardas por endpoint; contraseñas con bcrypt.
- CURP cifrada **AES-256-GCM** en reposo (búsqueda por huella HMAC).
- Rate limiting (throttling) por IP, helmet y validación estricta de DTOs.
- Bases de datos y servicios expuestos solo en 127.0.0.1 (el puente de desarrollo es el único acceso LAN).

---

## 🧪 Pruebas

- Backend: más de 80 pruebas unitarias (dominio + casos de uso con fakes): npm test.
- App móvil: npx tsc --noEmit y npx expo lint.

---

## 🗺️ Hoja de ruta

- [x] Microservicios hexagonales (identity, cold-chain, registry, routes, advisor)
- [x] RAG + pgvector + Ollama con citas
- [x] IoT: Node-RED (5 hieleras) + n8n → Telegram
- [x] GPS en tiempo real (PostGIS + WebSocket)
- [x] App móvil con modo campo offline
- [ ] Operaciones de edición/eliminación (desactivar usuarios, eliminar lotes y puntos)
- [ ] Despliegue en la nube (Dockerfiles, migraciones, HTTPS, backups)
- [ ] Build de iOS/Android (EAS) — iOS requiere Apple Developer

---

## 📄 Documentación de referencia

- documentos/ — fuentes oficiales del RAG (PDFs y textos extraídos)
- scripts/ — arranque y apagado de la demo
- mobile/ — aplicación móvil

---

*Proyecto académico · Área de Salud · Noviembre 2026*

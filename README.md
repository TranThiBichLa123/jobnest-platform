# JobNest Platform

JobNest is a full-stack recruitment platform built with **Next.js (TypeScript)** and **Spring Boot (Java 17)**.  
This repository contains both **Frontend** and **Backend** in a single monorepo.

It supports job search &amp; filters, CV/profile management, employer postings, application tracking, real-time notifications/chat, and an admin dashboard.

---

## 📦 Repository Structure

```
jobnest-platform/
├── frontend/                 # Next.js app (TypeScript)
└── backend/                  # Spring Boot app (Java 17)
```

---

## 🧱 Architecture Overview

### Frontend (Next.js)
Frontend uses a **feature-first modular architecture**:

```
frontend/src/
├── app/                      # Next.js App Router routes
├── features/                 # Domain modules (auth, jobs, candidate, ...)
├── shared/                   # Shared reusable layer (api/components/types/hooks)
└── config/                   # Environment/config helpers
```

### Backend (Spring Boot)
Backend uses a **clean modular monolith** structure:

```
backend/src/main/java/com/jobnest/backend/
├── modules/                  # Domain modules
│   └── <domain>/
│       ├── api/
│       ├── application/
│       ├── domain/
│       └── infrastructure/
├── shared/                   # Cross-cutting concerns (security, exception, audit, config, ...)
└── integration/              # External services (email, google, ...)
```

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- React + TypeScript
- Shared API client (canonical HTTP client in `shared/api`)
- Modular structure: `features/*` + `shared/*`

### Backend
- Spring Boot
- Java 17
- Maven Wrapper (`./mvnw`)
- Modular monolith: `modules/<domain>/*`

### Database
- PostgreSQL (recommended)

---

## ⚙️ Requirements

### Required
- **Node.js**: 18+ (recommended)
- **npm**: 9+
- **Java**: 17
- **PostgreSQL**: 14+ (recommended)

### Optional Tools
- IntelliJ IDEA / VSCode
- Postman / Insomnia

---

## 🚀 Getting Started

### 1) Clone repo
```bash
git clone <REPO_URL>
cd jobnest-platform
```

---

## ▶️ Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:
- http://localhost:3000

### Build Frontend
```bash
npm run build
npm run start
```

---

## ▶️ Run Backend

> Ensure Java 17 is installed and `JAVA_HOME` points to Java 17.

```bash
cd backend
./mvnw clean package
./mvnw spring-boot:run
```

Backend will run at:
- http://localhost:8080

### Run Tests
```bash
./mvnw clean test
```

---

## 🔑 Environment Variables

### Frontend `.env.local`
Create file:
```
frontend/.env.local
```

Example:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

> Add more variables as needed (Google OAuth, etc.).

### Backend `application.properties`
Backend configs are located in:
- `backend/src/main/resources/application.properties`

Example values (adjust for your DB):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/jobnest
spring.datasource.username=postgres
spring.datasource.password=postgres
```

---

## 📌 Development Rules (Important)

### Frontend Rules
✅ Allowed imports:
- `@/features/*`
- `@/shared/*`
- `@/config/*`

🚫 Not allowed:
- reintroducing legacy folders (`components/`, `lib/`, `context/`, `types/` at root)

Feature boundaries:
- `features/<domain>` should not directly import another `features/<domain2>`
- shared code must go into `shared/*`

---

### Backend Rules
- All domain code must live under `modules/*`
- No legacy layered folders should be reintroduced
- Cross-cutting code belongs in `shared/*`
- External services belong in `integration/*`

---

## 🧩 Domain Modules

### Frontend Features
- auth
- jobs
- applications
- candidate
- company
- community
- notifications
- home

### Backend Modules
- applications
- auth
- candidate
- communitypost
- company
- jobs
- notification
- chat (future-ready)
- payment (future-ready)

---

## 📄 Documentation

Architecture & refactoring reports:
- `ARCHITECTURE_v4.md` / `ARCHITECTURE_v5.md`
- `ABSOLUTE_CLEANUP_COMPLETE.md`
- `BACKEND_FINAL_VERIFICATION.md`

---

## 🧪 Verification Checklist

Before pushing:
### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
./mvnw clean test package
```

---

## 🤝 Contributing

1. Create branch:
```bash
git checkout -b feature/<name>
```

2. Commit:
```bash
git commit -m "feat: ..."
```

3. Push and open PR.

---

## 📜 License
Private / Internal project.

# EzMR — Real-Time, HIPAA-Aware EMR Access for EMS

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/Auth-NextAuth.js-3b82f6" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-7c3aed" />
  <img src="https://img.shields.io/badge/3D-React%20Three%20Fiber-10b981" />
  <img src="https://img.shields.io/badge/Storage-Cloudinary-00BCD4?logo=cloudinary" />
</p>

> EzMR gives EMS teams real-time, HIPAA- and HIE-compliant access to critical patient data so they can make life-saving decisions under pressure.

---

## Table of Contents

- [Why EzMR](#why-ezmr)
- [What It Does](#what-it-does)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Usage Walkthrough](#usage-walkthrough)
- [Security & Compliance](#security--compliance)
- [Screens & Visuals](#screens--visuals)
- [Challenges & Learnings](#challenges--learnings)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Why EzMR

In emergencies, seconds matter. Paramedics often treat without context on allergies, implants, meds, and history due to fragmented HIE rules and strict “minimum necessary” HIPAA sharing. EzMR acts as the compliant bridge between hospitals and EMS, unlocking **only** what each state and role permits.

---

## What It Does

- **Compliance Filter:** Dynamically exposes _permitted_ patient fields by **state HIE** + **HIPAA** rules.
- **Unified EMR View:** Normalizes records across common EMR systems into a clean, queryable schema.
- **Fast Decision Support:** AI-powered search and 3D medical visualization reduce cognitive load in the field.

---

## Key Features

- **AI Clinical Search** — Pull allergies, meds, vitals, and conditions from messy notes in seconds.
- **3D Medical Diagramming** — React Three Fiber models with skeleton overlays + clickable body regions.
- **Medical Imaging** — DICOM/X-ray upload & viewing with window/level, zoom, and multi-slice.
- **Secure Uploads** — Cloudinary pipelines for sensitive docs & imaging.
- **Audit & RBAC** — Fine-grained, role-based permissions with full read audit trails.
- **Multi-Tenant SaaS** — Hospital/agency separation, break-glass access, and comprehensive logging.
- **Real-Time UI** — Debounced APIs, optimistic updates, robust error handling.

---

## Architecture

### High-Level System Diagram (Mermaid)

```mermaid
flowchart LR
  subgraph EMS
    A[Medic Tablet] -- Auth --> G[NextAuth]
    A -- Query --> B[Next.js API Routes]
  end

  subgraph Backend (Vercel)
    B -- RBAC/Policies --> P[Policy Engine (HIPAA/HIE)]
    B -- AI Parse --> M[Gemini via Maestra]
    B -- DICOM Parse --> D[dicom-parser]
    B -- Upload --> C[Cloudinary]
    B -- ORM --> R[(PostgreSQL/Prisma)]
  end

  subgraph Hospital
    H1[EMR Systems] --> R
  end

  G -. Sessions .-> R
  P -. Audit Trails .-> R
  C -. Secure Assets .-> A
```

### Data Model Highlights

- 25+ Prisma models: `Patient`, `Allergies`, `Medications`, `Problems`, `ClinicalNotes`, etc.
- Multi-tenant schema with role-based access and full audit logging.
- AI pipeline maps **800+ medical terms** for injury/body-part identification.

---

## Tech Stack

- **Frontend:** Next.js + React + TypeScript, Tailwind, Radix UI, Shadcn, Framer Motion
- **3D/Graphics:** Three.js, React Three Fiber, Drei
- **Backend/APIs:** Next.js API routes, Vercel AI SDK
- **AI:** Google Gemini 2.0 Flash via Maestra Agent Framework (structured output schemas)
- **Database:** PostgreSQL (Neon) + Prisma
- **Auth:** NextAuth.js (magic links via Resend), break-glass emergency access
- **Files/Imaging:** Cloudinary, JSZip, dicom-parser
- **Compliance:** HIPAA/HIE policy filters, field-level permissions, exhaustive auditing

---

## Setup

> Prereqs: Node 18+, PNPM/NPM, PostgreSQL (Neon URL), Cloudinary creds, NextAuth secrets.

```bash
# 1) Install
pnpm install

# 2) Env
cp .env.example .env.local
# fill in: DATABASE_URL, NEXTAUTH_SECRET, CLOUDINARY_*, GEMINI_API_KEY, RESEND_API_KEY

# 3) DB & Prisma
pnpm prisma migrate deploy
pnpm prisma generate

# 4) Dev
pnpm dev
```

---

## Usage Walkthrough

1. **Sign In** via magic link (NextAuth + Resend).
2. **Onboard Tenant** (hospital/EMS agency), create roles, assign field-level permissions.
3. **Import/Sync Records** from EMR or upload DICOM/X-ray; metadata normalized in Prisma.
4. **Use AI Clinical Search** to surface allergies/meds/vitals and structured summaries.
5. **Visualize** patient issues with 3D anatomical model overlays (clickable regions).
6. **Audit** every access — reads/writes logged automatically for compliance.

---

## Security & Compliance

- **Minimum Necessary**: Policy engine reveals only what each role/state permits.
- **RBAC + Field-Level Controls**: Admins toggle fields per role; UI renders any combination cleanly.
- **Audit Trails**: Every read/write captured with actor, timestamp, and context.
- **Break-Glass**: Emergency access with mandatory post-hoc review.

---

## Screens & Visuals

> Drop screenshots or short clips here when you’ve deployed the app (UI dashboard, DICOM viewer, 3D model view, AI search results).

- DICOM viewer showing window/level & multi-slice
- 3D model with body-part highlights
- AI search panel extracting allergies/meds
- Role editor (field-level toggles)
- Audit trail explorer

---

## Challenges & Learnings

- **AI Note Structuring**: Reliable, schema-bound outputs required multi-step prompts + Maestra structured schemas.
- **3D Model Tradeoffs**: Pure prisms lacked clarity; pure skeleton was heavy. **Hybrid** model delivered responsiveness **and** readability.
- **Security Design**: “Blanket filters” broke workflows. Field-level configurability + dashboard redesign solved it.

---

## Roadmap

- **Scale HIE Integrations** across states and major EMRs
- **Enterprise Partnerships** for production pilots
- **Global Access** with offline-first kits for low-connectivity regions
- **Analytics**: outcomes dashboards & cohort insights
- **EMS UX**: voice-first flows, faster field data capture

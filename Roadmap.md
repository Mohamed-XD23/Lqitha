<p align="center">
  <h1 align="center">🚀 Lqitha — Development Roadmap</h1>
  <p align="center">
    <em>From foundation to production — a structured path for building the Lqitha lost-and-found verification platform.</em>
  </p>
</p>

<br>

> [!NOTE]
> This roadmap is divided into **6 sequential phases**. Each phase has clearly separated **Back-end** and **Front-end** tasks. Complete each phase before moving to the next.

---

## 📋 Overview

| Phase | Name | Focus |
|:-----:|------|-------|
| **0** | Environment Setup | Project scaffolding & tooling |
| **1** | Database & Foundation | Prisma, PostgreSQL, base UI |
| **2** | User Authentication | Auth.js, protected routes |
| **3** | Item Management (CRUD) | Server actions, forms, feeds |
| **4** | Lqitha Security Engine ⚡ | Hashing, claim verification |
| **5** | Dashboard & Communication | Owner dashboard, messaging |
| **6** | Final Polish & Deployment | Trust score, branding, deploy |

---

## Phase 0 · Environment Setup [Completed]

> **Goal:** Bootstrap the project with a production-ready developer environment.

- [x] Initialize **Next.js 15+** (App Router, TypeScript)
- [x] Configure **Tailwind CSS** & **Shadcn UI**
- [x] Set up **Git** repository and project structure
- [x] Configure `.env` file structure (DB URLs, Auth secrets)

---

## Phase 1 · Database & Foundation

> **Goal:** Establish the data layer and a basic UI shell.

### 🔧 Back-end / Server

- [x] Install **Prisma ORM**
- [x] Setup **PostgreSQL** instance (e.g., [Neon.tech](https://neon.tech))
- [x] Define `schema.prisma`
  - `User` · `Item` · `ClaimRequest` · `VerificationQuestion`
- [x] Run initial migration → `npx prisma migrate dev`

### 🎨 Front-end / UI

- [X] Create standard `Layout.tsx` (Navbar, Footer, Providers)
- [X] Build basic landing page structure

---

## Phase 2 · User Authentication

> **Goal:** Secure the platform with multi-provider authentication.

### 🔧 Back-end / Server

- [ ] Integrate **Auth.js** (NextAuth) with GitHub / Google / Credentials provider
- [ ] Create **Prisma Adapter** for database sessions

### 🎨 Front-end / UI

- [ ] Build **Login** & **Register** pages
- [ ] Implement **Protected Routes** (middleware) for authenticated-only actions

---

## Phase 3 · Item Management (CRUD)

> **Goal:** Enable users to post, browse, and view lost/found items.

### 🔧 Back-end / Server

- [ ] Write Server Action `createItem()` — PostgreSQL insertion
- [ ] Write Server Action `getItems()` — with pagination & filters

### 🎨 Front-end / UI

- [ ] Build **"Create Item"** multi-step form (React Hook Form & Zod)
- [ ] Implement **Item Feed** on the home page
- [ ] Create **"Item Details"** dynamic route → `/item/[id]`

---

## Phase 4 · The "Lqitha" Security Engine

> [!IMPORTANT]
> This is the **core differentiator** of the platform — the secret-answer verification system that prevents false claims.

### 🔧 Back-end / Server

- [ ] Install `bcrypt` for hashing
- [ ] Write Server Action `submitClaim()`:
  1. Accept `itemId` and `plainTextAnswer`
  2. Fetch `hashedAnswer` from DB
  3. Run `bcrypt.compare()`
  4. Update `ClaimRequest` table based on result

### 🎨 Front-end / UI

- [ ] Build **"Claim Item"** Modal / Form
- [ ] Implement feedback UI (✅ Success / ❌ Error states after submission)

---

## Phase 5 · Dashboard & Communication

> **Goal:** Give item owners full control over incoming claims and enable communication.

### 🔧 Back-end / Server

- [ ] Write Server Action `getClaimsByOwner()` — for the item owner
- [ ] Implement simple **Chat / Message** schema (or integrate a third-party service)

### 🎨 Front-end / UI

- [ ] Build **User Dashboard** — view items posted, view claims received
- [ ] Implement **Accept / Reject** buttons for the item owner to approve claims

---

## Phase 6 · Final Polish & Deployment

> **Goal:** Production-ready application with branding, scoring, and hosting.

### 🔧 Back-end / Server

- [ ] Implement `trustScore` calculation logic (e.g., increase on successful return)
- [ ] Run production build tests

### 🎨 Front-end / UI

- [ ] Finalize **UI/UX design** (colors, branding for Lqitha)
- [ ] Add **Toast notifications** (using [Sonner](https://sonner.emilkowal.dev/) or similar)
- [ ] **Final deployment** to [Vercel](https://vercel.com) 🎉

---

<p align="center">
  <strong>Built with ❤️ for the Lqitha platform</strong><br>
  <sub>Last updated: March 2026</sub>
</p>
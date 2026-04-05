# Skrible

**A Real-Time Collaborative Manuscript and Screenplay Platform**

Skrible is a full-stack web application engineered to facilitate structured, collaborative writing. Built as a solo engineering project, the platform moves beyond simple text editing to offer a decentralized contribution model where users can submit, review, and approve draft paragraphs. 

The architecture focuses on data integrity, strict type safety, real-time state synchronization, and production-oriented observability.

---

## 🎥 Product Demonstration

> **Note to self/reader:** Place a 2-3 minute loom/video walkthrough here. Focus the video on the collaboration flow: sending an invite, receiving the real-time notification, accepting it, submitting a paragraph, and seeing the UI update optimistically.

[![Skrible Video Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

---

## 📸 Interface Preview

> **Note to self/reader:** Place 3-4 high-quality product screenshots here. Recommended shots:
> 1. The unified Invite Collaborator modal showing search functionality.
> 2. The Draft Timeline view with markdown rendering and highlighted search terms.
> 3. The Notifications panel showing real-time accepted/declined states.
> 4. The Profile or Dashboard view showing the glassmorphism UI.

<div align="center">
  <img src="path/to/your/screenshot1.png" width="48%" alt="Draft Timeline View" />
  <img src="path/to/your/screenshot2.png" width="48%" alt="Collaborator Invite Flow" />
</div>

---

## 🏗 System Architecture

The application is built on a decoupled client-server architecture utilizing a modern React frontend and a Node.js/GraphQL backend. 

* **Data Fetching & State:** The frontend relies on Apollo Client for state management. Instead of manual global state stores, the application utilizes Apollo's normalized in-memory cache to handle optimistic UI updates and reduce redundant network requests.
* **API Layer:** The backend is powered by Apollo Server (GraphQL). It enforces strict input validation and resolves nested document relationships efficiently.
* **Persistence & Caching:** MongoDB serves as the primary data store, with Mongoose schemas strictly defining relationships. Redis is deployed as an in-memory caching layer to intercept read-heavy queries (like public draft exploration) and handle rate-limiting.
* **Telemetry:** The system is instrumented with Sentry for unhandled exceptions and PostHog for feature usage analytics, ensuring issues can be tracked and debugged in a production environment.

---

## ⚙️ Core Engineering Capabilities

The following features detail the specific technical implementations built to ensure a robust, product-grade application.

### 1. End-to-End Type Safety via GraphQL Codegen
To eliminate runtime `undefined` errors and structural mismatches, the project integrates automated GraphQL Code Generation. React hooks (e.g., `useGetScriptByIdQuery`, `useAcceptInvitationMutation`) are generated directly from backend schemas. This ensures the frontend strictly adheres to the database shape, catching schema changes during compilation rather than in production.

### 2. Role-Based Access Control (RBAC) & Member Management
The platform enforces a strict permission matrix (`OWNER`, `EDITOR`, `CONTRIBUTOR`, `VIEWER`). Backend GraphQL resolvers intercept mutations to verify JSON Web Tokens (JWT) and authorize actions. Only specific roles can alter visibility, kick members, or clear draft content. The frontend dynamically reflects these permissions, hiding destructive actions from unauthorized users.

### 3. Real-Time WebSockets & Transient State Cleanup
Socket.io is integrated to push immediate, event-driven updates to clients. When a user is invited to collaborate, a localized notification is emitted to their specific socket room. To maintain database hygiene and UI clarity, actionable notifications (like invites) are aggressively managed: once a user clicks "Accept", the UI updates optimistically, and a background timeout silently purges the resolved notification from the database to prevent stale state on reload.

### 4. Advanced Authentication & Session Management
User authentication is managed via **Better Auth**. This abstracts away the fragility of rolling custom cryptographic session logic, providing secure, hardened session management, secure cookie handling, and standardized token verification flows across the GraphQL context.

### 5. Production Observability (Sentry & PostHog)
To maintain the application post-deployment, two primary telemetry systems are integrated:
* **Sentry:** Captures unhandled promise rejections, GraphQL resolver failures, and React error boundaries. This allows for precise tracing of backend failures or frontend crashes.
* **PostHog:** Tracks user engagement paths, such as the conversion rate of collaboration invites or the frequency of paragraph submissions, providing raw data to guide future UI/UX refinements.

### 6. Caching & Request Throttling (Redis)
To protect the MongoDB instance from aggressive querying, Redis is implemented at the resolver level. 
* **Targeted Invalidation:** When a draft is updated, only the specific Redis keys associated with that draft and the public explore cache are invalidated (`cache-and-network` policies on the frontend handle the rest).
* **Rate Limiting:** IP and User-ID-based rate limiters restrict mutation frequency (e.g., limiting invite dispatches or paragraph submissions to prevent spam).

### 7. Encrypted Data Persistence
Draft content is secured at rest using `mongoose-field-encryption`. Sensitive fields such as the manuscript's title, description, and combined text are encrypted before being written to MongoDB, ensuring user intellectual property is protected at the database level.

### 8. Optimistic UI & Cache Normalization
To achieve a "zero-latency" feel, the frontend utilizes Apollo Client's `cache.modify` capabilities. When a user edits a draft's metadata (genres, languages, title) or accepts an invite, the local cache is manually traversed and updated using strict TypeScript typings, reflecting the change instantly without requiring a full page reload or secondary network fetch.

### 9. Component-Level Markdown Processing
User contributions are stored as raw text and rendered safely using `react-markdown` and `remark-gfm`. Additionally, a custom recursive React function was built to inject regex-based highlight wrappers (`<mark>`) around text that matches active search queries, parsing through nested markdown elements without breaking the AST (Abstract Syntax Tree).

### 10. Robust Form & Input Validation
Frontend forms and modal inputs utilize `Zod` for strict schema validation. Before any GraphQL mutation is triggered, data (like maximum tag counts, email formatting, and string lengths) is validated synchronously, surfacing errors via the `sonner` toast library and preventing unnecessary backend traffic.

---

## 💻 Technical Stack Overview

**Frontend:**
* React 18 & TypeScript
* Apollo Client (GraphQL Fetching & Caching)
* React Router DOM v6
* Tailwind CSS & Framer Motion (Styling & Animation)
* Zod (Schema Validation)
* Zustand (Local UI Auth State)

**Backend:**
* Node.js & Express
* Apollo Server (GraphQL API)
* MongoDB & Mongoose
* Redis (Caching & Rate Limiting)
* Socket.io (Real-time Events)

**Infrastructure & Tooling:**
* **Authentication:** Better Auth
* **Error Tracking:** Sentry
* **Product Analytics:** PostHog
* **Code Generation:** GraphQL Codegen

---

> *Designed and developed as a solo full-stack initiative.*
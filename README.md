# MediSafe Chain — Prototype

Frontend prototype for the final-year research project **"MediSafe Chain – Blockchain-Based
Intelligent Pharmaceutical Supply Chain Management with AI-Driven Medicine Risk Scoring."**

This is a **UI/UX prototype only** — there is no real backend, blockchain connection, or AI
model. All data is mocked in `src/data/` and served through simulated-latency functions in
`src/services/`, standing in for the eventual API/chain calls.

## Stack

React 18 · Vite · Tailwind CSS v4 · React Router · Lucide React · Recharts

## Getting started

```bash
npm install
npm run dev
```

## The four research components

1. **Medicine Traceability** (`/traceability`) — blockchain custody trail per batch.
2. **AI Risk Scoring** (`/risk-scoring`) — explainable AI risk scores per batch.
3. **Pharmacy Trust** (`/pharmacy-trust`) — dynamic, blockchain-based pharmacy reputation.
4. **Prescription Management** (`/prescriptions`) — privacy-preserving prescription anchoring.

Only the **Dashboard** and the app shell (routing, sidebar, top nav, design system) are fully
built out in this pass; the four component pages above are placeholders wired into routing/nav
and will be implemented one at a time.

## Project structure

```
src/
  components/
    layout/     Sidebar, TopNav, PageHeader — the app shell
    ui/         Reusable design-system primitives (Card, StatCard, badges, DataTable,
                Modal, ConfirmDialog, Toast, EmptyState, LoadingState, Timeline, …)
    charts/     Thin Recharts wrappers (activity, risk distribution, trust distribution)
    dashboard/  Dashboard-only composite widgets
  pages/        One file per route
  layouts/      AppLayout — sidebar + top nav + <Outlet />
  routes/       Route table (paths -> page components)
  data/         Static mock data (medicines, pharmacies, prescriptions, transactions, …)
  services/     Async wrappers around data/ (simulated latency) — the seam a real
                API/blockchain integration will later replace
  hooks/        useAsync (data-fetching lifecycle), useToast (toast notifications)
  utils/        formatters.js, constants.js (nav items, status/risk/trust color maps)
```

# 🚛 FleetFlow

**A modular fleet and logistics management platform** for optimizing fleet lifecycle, tracking performance, and managing day-to-day operations — built with Next.js, Prisma, and React.

---

## Overview

FleetFlow is a full-stack web application that helps fleet managers, dispatchers, safety officers, and financial analysts manage their vehicle fleets efficiently. It provides a centralized dashboard for tracking vehicles, drivers, trips, maintenance, fuel consumption, expenses, and analytics — all in one place.

## Key Features

- **Dashboard** — At-a-glance overview of fleet health, active trips, and key metrics.
- **Vehicle Management** — Track vehicle status (available, on-trip, in-shop, retired), odometer readings, acquisition costs, and regions.
- **Driver Management** — Manage driver profiles, license details, safety scores, completion rates, and duty status.
- **Trip Tracking** — Create, dispatch, and complete trips with origin/destination, cargo weight, distance, revenue, and fuel cost tracking.
- **Maintenance Logs** — Record and monitor vehicle maintenance history and service costs.
- **Fuel Tracking** — Log fuel consumption per trip or vehicle with cost and distance data.
- **Expense Management** — Categorize expenses (fuel, maintenance, toll, other) tied to trips, vehicles, or drivers.
- **Analytics** — Visualize fleet performance data with interactive charts (Recharts).
- **PDF Reports** — Generate and export reports using jsPDF.
- **Authentication** — Role-based access with JWT authentication (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst).

## Tech Stack

| Layer        | Technology                                   |
| ------------ | -------------------------------------------- |
| Framework    | Next.js 16 (App Router)                      |
| Language     | TypeScript                                   |
| Database     | SQLite via Prisma ORM                        |
| UI           | Tailwind CSS v4, shadcn/ui, Radix UI         |
| Charts       | Recharts                                     |
| State        | Zustand                                      |
| Auth         | JWT + bcrypt                                 |
| PDF Export   | jsPDF + jspdf-autotable                      |
| Icons        | Lucide React                                 |

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or yarn / pnpm)

### Installation

```bash
# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the app.

## Project Structure

```
src/
├── app/
│   ├── api/          # REST API routes (auth, vehicles, drivers, trips, etc.)
│   ├── dashboard/    # Dashboard pages (analytics, vehicles, drivers, trips, etc.)
│   └── login/        # Login page
├── components/       # Reusable UI components (navbar, sidebar, shadcn/ui)
├── hooks/            # Custom React hooks (API helpers)
├── lib/              # Utilities (auth, prisma client, helpers)
└── store/            # Zustand state management
prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Seed script
```

## License

This project is private and not licensed for redistribution.

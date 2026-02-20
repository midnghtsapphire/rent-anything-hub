# Rentable Documentation

Complete technical and business documentation for the Rentable rental marketplace.

## Files

### [BLUEPRINT.md](./BLUEPRINT.md)
High-level architecture, vision, tech stack, database overview, key features, design language, roadmap, and success metrics. Start here to understand the product.

### [API.md](./API.md)
Complete tRPC API reference with all endpoints, input/output schemas, error handling, rate limiting, and SDK usage examples.

### [SCHEMA.md](./SCHEMA.md)
Detailed database schema with table definitions, relationships (ERD), column descriptions, indexes, and common queries.

### [ROADMAP.md](./ROADMAP.md)
Product roadmap with phases, milestones, timelines, and feature priorities.

### [DEPLOYMENT.md](./DEPLOYMENT.md)
Deployment guide, environment setup, database migrations, monitoring, and troubleshooting.

## Quick Start

1. **Understanding the Product**: Read [BLUEPRINT.md](./BLUEPRINT.md)
2. **Building Features**: Reference [API.md](./API.md) and [SCHEMA.md](./SCHEMA.md)
3. **Deploying**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Planning Work**: Check [ROADMAP.md](./ROADMAP.md)

## Key Concepts

### Fair Value Engine
AI-powered pricing using Manus LLM. Prevents price gouging, ensures fair daily rates based on item, condition, and location.

### CO₂ Tracking
Every rental shows carbon savings vs. buying new. Cumulative impact tracked per user.

### Weird Vault
Curated discovery of bizarre rental items. Emotional support goats, haunted mirrors, astronaut suits.

### Emergency Mode
Disaster gear surfaces instantly with price caps during declared emergencies. Verified sellers only.

### Barter System
Trade items without money. Truck for goat boarding, staging furniture for labor.

### Neighborhood Circles
Every ZIP code is a micro-economy. Local sharing groups with reputation.

### 5 Accessibility Modes
- Default (dark theme)
- WCAG AAA (max contrast)
- ECO CODE (low energy)
- NEURO CODE (ADHD-friendly)
- DYSLEXIC MODE (OpenDyslexic font)
- NO BLUE LIGHT (warm filter)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Tailwind CSS 4, Wouter |
| Backend | Express 4, tRPC 11 |
| Database | MySQL/TiDB, Drizzle ORM |
| Auth | Manus OAuth |
| Payments | Stripe (dual-mode) |
| Storage | S3 |
| LLM | Manus LLM API |

## Database

- **9 core tables**: users, listings, rentals, reviews, barterOffers, tokenTransactions, neighborhoodCircles, circleMembers, adminSettings
- **Indexes**: Optimized for search (category, emergency, availability), user queries
- **Relationships**: Foreign keys enforce referential integrity

## API

All endpoints are tRPC procedures under `/api/trpc`:

- **Listings**: create, getById, search, myListings, update, suggestFairPrice
- **Rentals**: create, myRentals
- **Tokens**: balance, spend
- **Auth**: me, logout

## Design

- **Aesthetic**: Dark industrial + glassmorphism
- **Colors**: Electric teal (#0ea5e9), coral (#ff6b6b)
- **Typography**: Bebas Neue (headlines), Inter (body)
- **Responsive**: Mobile-first

## Deployment

Hosted on Manus with auto-generated domain. Custom domains supported. SSL automatic.

## Support

For questions, check the relevant documentation file or contact the development team.

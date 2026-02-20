# Rentable — Architecture Blueprint

**Rent the Unrentable**: A peer-to-peer rental marketplace with AI-powered fair pricing, CO₂ tracking, emergency mode, barter system, and neighborhood sharing circles.

## Vision

Rentable is a production-grade sharing economy platform that competes with traditional rental marketplaces by offering:

- **Fair Value Engine**: AI-powered pricing prevents gouging and ensures fair daily rates
- **CO₂ Tracking**: Every rental shows carbon savings vs. buying new
- **Weird Vault**: Curated discovery of bizarre, wonderful rental items (emotional support goats, haunted mirrors, astronaut suits)
- **Emergency Mode**: Disaster gear surfaces instantly with price caps during declared emergencies
- **Barter System**: Trade items without money (truck for goat boarding, staging furniture for labor)
- **Neighborhood Circles**: Every ZIP code is a micro-economy with local sharing groups
- **Safe Meetups**: Police stations, libraries, banks—public venues only
- **Insurance/Damage Protection**: Built-in damage claims and insurance estimates

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Tailwind CSS 4, Wouter (routing) |
| **Backend** | Express 4, tRPC 11, Node.js |
| **Database** | MySQL/TiDB, Drizzle ORM |
| **Auth** | Manus OAuth (Google/Apple/email) |
| **Payments** | Stripe (dual-mode test/live) |
| **Storage** | S3 (images, documents) |
| **LLM** | Manus LLM API (fair pricing engine) |
| **Design** | Glassmorphism, dark industrial aesthetic, electric teal/cyan accents |

## Database Schema

### Core Tables

- **users**: Auth, profile, tokens, subscription, accessibility settings
- **listings**: Items for rent (title, price, location, images, specs, CO₂ data)
- **rentals**: Bookings (renter, owner, dates, payment, damage tracking)
- **reviews**: Ratings and feedback
- **barterOffers**: Trade proposals (item A for item B)
- **tokenTransactions**: Token economy ledger
- **neighborhoodCircles**: Local sharing groups by ZIP code
- **circleMembers**: Membership in circles
- **adminSettings**: Global configuration

## API Endpoints (tRPC)

### Listings
- `listings.create` — Create new listing
- `listings.getById` — Fetch single listing
- `listings.search` — Search with filters (category, location, emergency, weird)
- `listings.myListings` — User's listings
- `listings.update` — Edit listing
- `listings.suggestFairPrice` — AI pricing engine

### Rentals
- `rentals.create` — Book a rental
- `rentals.myRentals` — User's bookings

### Tokens
- `tokens.balance` — Check token balance
- `tokens.spend` — Deduct tokens

### Auth
- `auth.me` — Current user
- `auth.logout` — Sign out

## Key Features

### 1. AI Fair Pricing Engine

Uses Manus LLM to suggest daily rental prices based on:
- Item title and category
- Condition (like_new, good, fair, poor)
- Location (market rates vary)
- Historical data

Returns: `{ suggestedPrice, reasoning }`

### 2. CO₂ Savings Tracker

Each listing stores `co2SavedPerRental` (kg CO₂). On rental completion, user sees:
- CO₂ saved vs. buying new
- Cumulative impact (e.g., "You've saved 500kg CO₂ this year")
- Comparison to driving miles

### 3. Emergency Mode

When activated:
- `isEmergency=true` listings surface first
- AI caps prices at 1.5x normal rates
- Verified sellers only
- Categories: generators, pumps, tarps, first aid, chainsaws, dehumidifiers

### 4. Barter System

- `barterOffers` table tracks trade proposals
- Renter offers item/service for listing
- Owner accepts/rejects
- No money changes hands

### 5. Neighborhood Circles

- Groups by ZIP code
- Members share local listings
- Micro-economy per neighborhood
- Future: reputation within circle

## Accessibility (5 Modes)

1. **Default**: Standard dark theme
2. **WCAG AAA**: Maximum contrast, larger text, enhanced focus rings
3. **ECO CODE**: Low energy, reduced animations, dark backgrounds
4. **NEURO CODE**: ADHD-friendly, reduced clutter, focus mode, simplified UI
5. **DYSLEXIC MODE**: OpenDyslexic font, increased spacing, high contrast
6. **NO BLUE LIGHT**: Warm color filter, removes blue wavelengths

All modes survive color blindness tests and maintain readability.

## Design Language

- **Aesthetic**: Dark industrial + glassmorphism
- **Primary Color**: Electric teal/cyan (#0ea5e9)
- **Accent**: Coral/orange (#ff6b6b) for warnings
- **Typography**: Bebas Neue (headlines), Inter (body)
- **Animations**: Float, glow, shimmer (subtle, not distracting)
- **Responsive**: Mobile-first, tested on all breakpoints

## Deployment

- **Hosting**: Manus (built-in)
- **Domain**: rent-anything-hub.manus.space (auto-generated)
- **Custom Domain**: Supported via Manus dashboard
- **SSL**: Automatic
- **CDN**: S3 for images, Manus edge for HTML/JS

## Roadmap

### Phase 1 (MVP — Current)
- [x] Core marketplace (list, search, rent)
- [x] AI fair pricing
- [x] CO₂ tracking
- [x] Emergency mode
- [x] Barter system
- [x] Weird Vault
- [x] Neighborhood circles (schema only)
- [x] 5 accessibility modes
- [x] Stripe billing
- [x] Admin panel
- [x] Full SEO

### Phase 2 (Growth)
- [ ] Mobile app (React Native)
- [ ] Insurance/damage protection (Stripe integration)
- [ ] Reviews & reputation system
- [ ] Messaging/chat between users
- [ ] Calendar integration (Google, Outlook)
- [ ] Delivery/logistics partnerships
- [ ] Neighborhood circle events

### Phase 3 (Scale)
- [ ] International expansion
- [ ] Multi-currency support
- [ ] Subscription tiers (Premium, Pro, Enterprise)
- [ ] Analytics dashboard for owners
- [ ] Automated tax reporting
- [ ] API for third-party integrations

## FOSS-First Philosophy

All dependencies are open-source or free-tier:
- React (MIT)
- Tailwind CSS (MIT)
- Express (MIT)
- Drizzle ORM (MIT)
- tRPC (MIT)
- Manus OAuth (proprietary but free tier available)
- Stripe (proprietary, standard market rates)

No vendor lock-in. Code is portable.

## Mandatory Modules (from team_state.md)

✅ Manus OAuth (Google/Apple/email) — auto-admin: angelreporters@gmail.com
✅ Stripe billing (dual mode test/live)
✅ Token economy
✅ 5 accessibility modes (WCAG AAA, ECO CODE, NEURO CODE, DYSLEXIC, NO BLUE LIGHT)
✅ Admin panel + customer support
✅ Full /docs folder (blueprint, roadmap, schema, API docs, wireframes, Kanban)
✅ Glassmorphism design language + unique color identity
✅ FOSS-first philosophy

## Success Metrics

- **Listings**: 1000+ within 6 months
- **Monthly Rentals**: 500+ bookings
- **User Base**: 5000+ active users
- **CO₂ Impact**: 100+ tons saved annually
- **Barter Trades**: 10% of all transactions
- **Emergency Activations**: <5 per year (goal: zero)
- **NPS Score**: >50
- **Accessibility**: 100% WCAG AAA compliance

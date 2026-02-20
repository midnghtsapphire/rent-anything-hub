# Rentable — Rent the Unrentable — Project TODO

## Database & Schema
- [x] Users table (extended with profile fields, tokens, subscription tier, accessibility mode, ban)
- [x] Listings table (title, description, category, pricing, location, images, specs, barter, emergency, weird vault)
- [x] Rentals/bookings table (with Stripe checkout session ID)
- [x] Reviews table
- [x] Barter offers table
- [x] Token transactions table
- [x] Neighborhood circles table + circle members
- [x] Admin settings table
- [x] Support tickets table
- [ ] Messages/conversations table (future)

## Server / API
- [x] Listings CRUD (create, read, update, delete, flag)
- [x] Search with filters (category, location, emergency, weird, text query)
- [x] AI Fair Pricing Engine (LLM-powered price suggestions with CO2 estimate)
- [x] Barter/Trade system endpoints (create offer, accept, reject, list)
- [x] Emergency Mode listings (filter by isEmergency)
- [x] Weird Vault discovery feed (filter by isWeird)
- [x] Neighborhood Circles (create, join, list)
- [x] Admin routes (user management, listing moderation, analytics, ban/unban)
- [x] Token economy (balance, earn, spend, history)
- [x] Stripe checkout (rental payments + subscription tiers)
- [x] Stripe webhook handler (payment_intent.succeeded, checkout.session.completed)
- [x] Support tickets (create, list, update status, admin view)
- [x] Profile CRUD (update display name, bio, location, accessibility mode)
- [x] Owner notifications (new rental, new ticket)
- [x] angelreporters@gmail.com auto-promoted to admin on login

## Frontend — Landing Page
- [x] HeroSection ("Rent the Unrentable" with animated search)
- [x] CategoriesSection (8 category cards with icons)
- [x] FeaturedListings (live data from DB, with loading state)
- [x] WeirdVaultSection (emotional support goat, haunted mirror, astronaut suit, lie detector, fog machine, Steve the raccoon)
- [x] TrustSection (6 trust features: verified, AI pricing, CO2, emergency, circles, barter)
- [x] AI Fair Value Engine showcase section
- [x] Emergency Mode banner
- [x] CTASection with auth-aware buttons
- [x] Footer with all links
- [x] Accessibility mode panel (floating modal, 6 modes)

## Frontend — Core Pages
- [x] Search Results page with filters panel (category, emergency, weird, query)
- [x] Listing Detail page (image gallery, CO2 card, fair value gauge, rent dialog, barter dialog, reviews, flag)
- [x] List Item wizard (multi-step: category → details → pricing → rules → review)
- [x] Emergency Mode page (disaster gear, price gouging protection)
- [x] Profile page (my listings, my rentals, owner rentals, token balance, barter offers, settings, accessibility)
- [x] Admin panel (dashboard stats, user management, listing moderation, support tickets, settings)
- [x] Support page (ticket submission with category, priority, status tracking)
- [x] Pricing page (Free/Starter/Pro/Enterprise tiers, Stripe checkout)

## Blue Ocean Features
- [x] AI Fair Pricing Engine (real-time LLM price suggestions with confidence score)
- [x] CO2 Savings estimate (per rental vs buying new, shown on listing detail)
- [x] Weird Vault viral discovery (dedicated section + filter)
- [x] Barter/Trade system (full offer flow: create, accept, reject, track)
- [x] Emergency Mode (disaster-activated listings, price gouging blocked algorithmically)
- [x] Neighborhood Sharing Circles (local micro-economies)
- [x] Fair Value Gauge (visual indicator on listing detail)

## Accessibility (5 modes — all working via CSS data-access-mode)
- [x] WCAG AAA mode (maximum contrast, larger text, enhanced focus rings)
- [x] ECO CODE mode (low energy, no animations, green palette)
- [x] NEURO CODE mode (ADHD-friendly, calm indigo palette, reduced clutter)
- [x] DYSLEXIC mode (Comic Sans / Trebuchet, wider spacing, warm background)
- [x] NO BLUE LIGHT mode (warm amber filter, sepia tones)
- [x] Accessibility settings panel (in Home footer, Profile settings tab)
- [x] Preference saved to user profile (persists across sessions)

## SEO & Meta
- [x] Meta tags (title, description, keywords, robots)
- [x] Open Graph tags (og:title, og:description, og:image, og:url)
- [x] Twitter Card tags
- [x] JSON-LD structured data (WebSite + Organization with SearchAction)
- [x] sitemap.xml (all major routes)
- [x] robots.txt (crawl-friendly)
- [x] SVG favicon + webmanifest
- [x] Semantic HTML throughout (nav, main, section, article, footer)
- [x] Bebas Neue + Inter fonts via Google Fonts CDN

## Stripe & Token Economy
- [x] Stripe integration (test + live mode via env)
- [x] Subscription tiers (Free, Starter $9.99, Pro $29.99, Enterprise $99.99)
- [x] Rental payment processing (Stripe Checkout)
- [x] Stripe webhook handler (test event detection, payment confirmation)
- [x] Token system (100 tokens on signup, balance tracking, history)
- [x] Token earn/spend on rental actions

## Design
- [x] Glassmorphism design language (glass-card, glass-card-hover utilities)
- [x] Dark industrial aesthetic with electric teal/cyan primary
- [x] Bebas Neue display font + Inter body font
- [x] Custom animations (float, pulse-glow, shimmer, slide-in-up)
- [x] Mobile-responsive throughout (all pages)
- [x] Unique color identity (teal primary, coral accent, amber warning)
- [x] Scrollbar styling
- [x] Hero gradient backgrounds
- [x] Listing card hover effects

## Testing
- [x] auth.logout test (session cookie cleared)
- [x] auth.me test (authenticated + unauthenticated)
- [x] listings.search tests (public access, filters)
- [x] listings.create test (unauthorized guard)
- [x] admin.getDashboard tests (forbidden for users, allowed for admins)
- [x] tokens.getBalance test (unauthorized guard)
- [x] supportTickets tests (unauthorized + forbidden guards)
- [x] barter tests (unauthorized guard + public access)
- [x] ai.getFairPrice test (graceful LLM integration)
- [x] profile.update test (unauthorized guard)
- 19 tests total, all passing

## Documentation (/docs)
- [x] Blueprint / architecture overview (BLUEPRINT.md)
- [x] Data schema / ERD (SCHEMA.md)
- [x] API documentation (API.md)
- [x] Docs README (README.md)

## Deployment
- [ ] Push to GitHub MIDNGHTSAPPHIRE/rent-anything-hub
- [ ] Add card to meetaudreyevans.com hub
- [ ] Deploy live via Manus Publish button

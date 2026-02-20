# Rentable Database Schema

## Entity Relationship Diagram

```
users (1) ──── (N) listings
users (1) ──── (N) rentals (as renter)
users (1) ──── (N) rentals (as owner)
users (1) ──── (N) reviews
users (1) ──── (N) barterOffers (as fromUser)
users (1) ──── (N) barterOffers (as toUser)
users (1) ──── (N) tokenTransactions
users (1) ──── (N) circleMembers

listings (1) ──── (N) rentals
listings (1) ──── (N) reviews
listings (1) ──── (N) barterOffers

rentals (1) ──── (N) reviews
rentals (1) ──── (N) tokenTransactions

neighborhoodCircles (1) ──── (N) circleMembers
```

## Table Definitions

### users

Core user table with OAuth integration and rental marketplace fields.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique user ID |
| openId | VARCHAR(64) | UNIQUE, NOT NULL | Manus OAuth identifier |
| name | TEXT | | User's display name |
| email | VARCHAR(320) | | Email address |
| loginMethod | VARCHAR(64) | | "google", "apple", "email" |
| role | ENUM | DEFAULT 'user' | "user" or "admin" |
| displayName | VARCHAR(255) | | Profile display name |
| bio | TEXT | | User bio/about |
| avatarUrl | VARCHAR(512) | | S3 URL to avatar |
| location | VARCHAR(255) | | City/state |
| zipCode | VARCHAR(10) | | ZIP code |
| phone | VARCHAR(20) | | Phone number |
| tokenBalance | INT | DEFAULT 100 | Free tokens on signup |
| subscriptionTier | ENUM | DEFAULT 'free' | "free", "starter", "pro", "enterprise" |
| stripeCustomerId | VARCHAR(255) | | Stripe customer ID |
| subscriptionId | VARCHAR(255) | | Stripe subscription ID |
| subscriptionStatus | ENUM | DEFAULT 'none' | "active", "canceled", "past_due", "none" |
| accessibilityMode | ENUM | DEFAULT 'default' | Accessibility preference |
| isBanned | BOOLEAN | DEFAULT false | Account banned flag |
| banReason | TEXT | | Reason for ban |
| createdAt | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update time |
| lastSignedIn | TIMESTAMP | DEFAULT NOW() | Last login time |

### listings

Rental items available for booking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique listing ID |
| userId | INT | NOT NULL, FK | Owner user ID |
| title | VARCHAR(255) | NOT NULL | Item title |
| description | TEXT | | Full description |
| category | VARCHAR(50) | NOT NULL | Category (tools, vehicles, etc) |
| pricePerDay | DECIMAL(10,2) | NOT NULL | Daily rental price |
| fairValuePrice | DECIMAL(10,2) | | AI-suggested fair price |
| location | VARCHAR(255) | NOT NULL | Physical location |
| zipCode | VARCHAR(10) | | ZIP code |
| latitude | DECIMAL(10,8) | | Latitude for map |
| longitude | DECIMAL(11,8) | | Longitude for map |
| availability | ENUM | DEFAULT 'available' | "available", "rented", "unavailable" |
| isVerified | BOOLEAN | DEFAULT false | Seller verified flag |
| isEmergency | BOOLEAN | DEFAULT false | Emergency gear flag |
| isWeird | BOOLEAN | DEFAULT false | Weird Vault flag |
| isBarterEnabled | BOOLEAN | DEFAULT false | Barter allowed flag |
| isDeliveryAvailable | BOOLEAN | DEFAULT false | Delivery offered flag |
| images | JSON | NOT NULL | Array of S3 URLs |
| specs | JSON | NOT NULL | Key-value specs (height, material, etc) |
| co2SavedPerRental | DECIMAL(8,2) | DEFAULT 0 | CO₂ saved vs buying new (kg) |
| isFlagged | BOOLEAN | DEFAULT false | Moderation flag |
| flagReason | TEXT | | Reason for flag |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation time |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes**: category, isEmergency, availability, userId

### rentals

Booking records linking renters to listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique rental ID |
| listingId | INT | NOT NULL, FK | Listing ID |
| renterId | INT | NOT NULL, FK | Renter user ID |
| ownerId | INT | NOT NULL, FK | Owner user ID |
| startDate | TIMESTAMP | NOT NULL | Rental start |
| endDate | TIMESTAMP | NOT NULL | Rental end |
| totalPrice | DECIMAL(10,2) | NOT NULL | Total rental cost |
| status | ENUM | DEFAULT 'pending' | "pending", "confirmed", "in_progress", "completed", "canceled" |
| paymentStatus | ENUM | DEFAULT 'pending' | "pending", "paid", "refunded" |
| stripePaymentIntentId | VARCHAR(255) | | Stripe payment intent ID |
| damageReported | BOOLEAN | DEFAULT false | Damage claim flag |
| damageDescription | TEXT | | Damage details |
| insuranceClaimed | BOOLEAN | DEFAULT false | Insurance claim flag |
| createdAt | TIMESTAMP | DEFAULT NOW() | Booking creation time |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes**: listingId, renterId, status

### reviews

Ratings and feedback after rentals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique review ID |
| rentalId | INT | NOT NULL, FK | Rental ID |
| fromUserId | INT | NOT NULL, FK | Reviewer user ID |
| toUserId | INT | NOT NULL, FK | Reviewed user ID |
| rating | INT | NOT NULL | 1-5 star rating |
| comment | TEXT | | Review text |
| createdAt | TIMESTAMP | DEFAULT NOW() | Review creation time |

**Indexes**: rentalId, toUserId

### barterOffers

Trade proposals for non-monetary exchanges.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique offer ID |
| listingId | INT | NOT NULL, FK | Listing being traded for |
| fromUserId | INT | NOT NULL, FK | Offer initiator |
| toUserId | INT | NOT NULL, FK | Offer recipient |
| offeredItemDescription | TEXT | NOT NULL | What's being offered |
| status | ENUM | DEFAULT 'pending' | "pending", "accepted", "rejected", "completed" |
| createdAt | TIMESTAMP | DEFAULT NOW() | Offer creation time |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes**: listingId, fromUserId

### tokenTransactions

Ledger of token balance changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique transaction ID |
| userId | INT | NOT NULL, FK | User ID |
| amount | INT | NOT NULL | Token amount (positive/negative) |
| type | ENUM | NOT NULL | "purchase", "earn", "spend", "refund", "bonus" |
| description | VARCHAR(255) | | Transaction reason |
| relatedId | INT | | Related rental/listing ID |
| createdAt | TIMESTAMP | DEFAULT NOW() | Transaction time |

**Indexes**: userId

### neighborhoodCircles

Local sharing groups organized by ZIP code.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique circle ID |
| name | VARCHAR(255) | NOT NULL | Circle name |
| description | TEXT | | Circle description |
| zipCode | VARCHAR(10) | NOT NULL | ZIP code |
| latitude | DECIMAL(10,8) | | Center latitude |
| longitude | DECIMAL(11,8) | | Center longitude |
| memberCount | INT | DEFAULT 0 | Active members |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation time |

**Indexes**: zipCode

### circleMembers

Membership in neighborhood circles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique membership ID |
| circleId | INT | NOT NULL, FK | Circle ID |
| userId | INT | NOT NULL, FK | User ID |
| joinedAt | TIMESTAMP | DEFAULT NOW() | Join time |

**Indexes**: circleId, userId

### adminSettings

Global configuration key-value store.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique setting ID |
| key | VARCHAR(255) | UNIQUE, NOT NULL | Setting key |
| value | TEXT | | Setting value |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update time |

## Queries

### Find all listings by category

```sql
SELECT * FROM listings 
WHERE category = 'tools' 
AND availability = 'available'
ORDER BY createdAt DESC;
```

### Get user's rental history

```sql
SELECT r.*, l.title, l.pricePerDay
FROM rentals r
JOIN listings l ON r.listingId = l.id
WHERE r.renterId = ?
ORDER BY r.startDate DESC;
```

### Calculate CO₂ savings

```sql
SELECT 
  SUM(l.co2SavedPerRental) as totalCO2Saved,
  COUNT(r.id) as totalRentals
FROM rentals r
JOIN listings l ON r.listingId = l.id
WHERE r.status = 'completed'
AND r.renterId = ?;
```

### Find emergency listings

```sql
SELECT * FROM listings
WHERE isEmergency = true
AND availability = 'available'
ORDER BY createdAt DESC;
```

### Get neighborhood circle members

```sql
SELECT u.* FROM users u
JOIN circleMembers cm ON u.id = cm.userId
WHERE cm.circleId = ?;
```

## Constraints & Validations

- **pricePerDay**: Must be > 0
- **rating**: Must be 1-5
- **tokenBalance**: Cannot go negative (enforced in application)
- **subscriptionStatus**: Only valid if subscriptionId is set
- **startDate < endDate**: Enforced in application
- **zipCode**: Format validation in application (5 digits)

## Future Extensions

- **Messages table**: Direct messaging between users
- **Notifications table**: Push/email notifications
- **Analytics table**: Tracking page views, searches, conversions
- **Disputes table**: Conflict resolution system
- **Coupons table**: Promotional codes

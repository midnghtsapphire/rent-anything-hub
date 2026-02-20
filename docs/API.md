# Rentable API Documentation

All endpoints are tRPC procedures. Base URL: `/api/trpc`

## Authentication

All protected endpoints require a valid session cookie (set by OAuth callback). Use `publicProcedure` for unauthenticated access, `protectedProcedure` for authenticated.

### Auth Endpoints

#### `auth.me`
Returns current user or null.

**Type**: Public Query

**Response**:
```json
{
  "id": 1,
  "openId": "google_123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "tokenBalance": 100,
  "subscriptionTier": "free"
}
```

#### `auth.logout`
Clears session cookie.

**Type**: Public Mutation

**Response**:
```json
{ "success": true }
```

## Listings Endpoints

#### `listings.create`
Create a new rental listing.

**Type**: Protected Mutation

**Input**:
```json
{
  "title": "Professional Ladder",
  "description": "20ft aluminum ladder, excellent condition",
  "category": "tools",
  "pricePerDay": 15.00,
  "location": "Denver, CO",
  "zipCode": "80202",
  "images": ["https://s3.../image1.jpg"],
  "specs": {
    "height": "20ft",
    "material": "aluminum",
    "weight": "35lbs"
  },
  "isEmergency": false,
  "isWeird": false,
  "isBarterEnabled": true,
  "isDeliveryAvailable": false
}
```

**Response**:
```json
{
  "id": 42,
  "userId": 1,
  "title": "Professional Ladder",
  "category": "tools",
  "pricePerDay": "15.00",
  "fairValuePrice": null,
  "availability": "available",
  "isVerified": false,
  "createdAt": "2026-02-20T15:30:00Z"
}
```

#### `listings.getById`
Fetch a single listing by ID.

**Type**: Public Query

**Input**:
```json
{ "id": 42 }
```

**Response**:
```json
{
  "id": 42,
  "userId": 1,
  "title": "Professional Ladder",
  "description": "20ft aluminum ladder, excellent condition",
  "category": "tools",
  "pricePerDay": "15.00",
  "fairValuePrice": "16.50",
  "location": "Denver, CO",
  "zipCode": "80202",
  "images": ["https://s3.../image1.jpg"],
  "specs": { "height": "20ft", "material": "aluminum" },
  "availability": "available",
  "isVerified": true,
  "isEmergency": false,
  "isWeird": false,
  "isBarterEnabled": true,
  "co2SavedPerRental": "12.50",
  "createdAt": "2026-02-20T15:30:00Z"
}
```

#### `listings.search`
Search listings with optional filters.

**Type**: Public Query

**Input**:
```json
{
  "category": "tools",
  "zipCode": "80202",
  "isEmergency": false,
  "isWeird": false
}
```

**Response**:
```json
[
  {
    "id": 42,
    "title": "Professional Ladder",
    "pricePerDay": "15.00",
    "location": "Denver, CO",
    "availability": "available"
  }
]
```

#### `listings.myListings`
Get all listings owned by current user.

**Type**: Protected Query

**Response**:
```json
[
  {
    "id": 42,
    "title": "Professional Ladder",
    "category": "tools",
    "pricePerDay": "15.00",
    "availability": "available"
  }
]
```

#### `listings.update`
Update an existing listing.

**Type**: Protected Mutation

**Input**:
```json
{
  "id": 42,
  "data": {
    "pricePerDay": 18.00,
    "availability": "unavailable"
  }
}
```

**Response**:
```json
{ "success": true }
```

#### `listings.suggestFairPrice`
Get AI-powered fair price suggestion.

**Type**: Public Query

**Input**:
```json
{
  "title": "Professional Ladder",
  "category": "tools",
  "condition": "good",
  "location": "Denver, CO"
}
```

**Response**:
```json
{
  "suggestedPrice": 16.50,
  "reasoning": "20ft aluminum ladders rent for $15-18/day in Denver. Your condition is good, so $16.50 is fair."
}
```

## Rentals Endpoints

#### `rentals.create`
Book a rental.

**Type**: Protected Mutation

**Input**:
```json
{
  "listingId": 42,
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": "2026-03-03T00:00:00Z",
  "totalPrice": 45.00
}
```

**Response**:
```json
{
  "id": 100,
  "listingId": 42,
  "renterId": 5,
  "ownerId": 1,
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": "2026-03-03T00:00:00Z",
  "totalPrice": "45.00",
  "status": "pending",
  "paymentStatus": "pending"
}
```

#### `rentals.myRentals`
Get all rentals for current user (as renter).

**Type**: Protected Query

**Response**:
```json
[
  {
    "id": 100,
    "listingId": 42,
    "status": "pending",
    "totalPrice": "45.00",
    "startDate": "2026-03-01T00:00:00Z"
  }
]
```

## Tokens Endpoints

#### `tokens.balance`
Check current token balance.

**Type**: Protected Query

**Response**:
```json
{ "balance": 100 }
```

#### `tokens.spend`
Deduct tokens from balance.

**Type**: Protected Mutation

**Input**:
```json
{
  "amount": 10,
  "reason": "Premium listing boost"
}
```

**Response**:
```json
{
  "success": true,
  "newBalance": 90
}
```

## Error Handling

All errors return standard tRPC error format:

```json
{
  "code": "UNAUTHORIZED|BAD_REQUEST|NOT_FOUND|INTERNAL_SERVER_ERROR",
  "message": "Human-readable error message"
}
```

Common errors:

| Code | Meaning |
|------|---------|
| UNAUTHORIZED | User not authenticated or insufficient permissions |
| BAD_REQUEST | Invalid input parameters |
| NOT_FOUND | Resource not found |
| INTERNAL_SERVER_ERROR | Server error (contact support) |

## Rate Limiting

- Public endpoints: 100 requests/minute per IP
- Authenticated endpoints: 1000 requests/minute per user
- Search: 50 requests/minute per IP

## Pagination

Search results are limited to 100 items. For larger datasets, use filters to narrow results.

## Webhooks

Future: Stripe webhooks for payment confirmations, rental status changes, review notifications.

## SDK

Use the frontend tRPC client:

```typescript
import { trpc } from "@/lib/trpc";

// Query
const { data: listing } = trpc.listings.getById.useQuery({ id: 42 });

// Mutation
const createListing = trpc.listings.create.useMutation();
await createListing.mutateAsync({
  title: "Ladder",
  category: "tools",
  pricePerDay: 15,
  location: "Denver, CO"
});
```

## Changelog

### v1.0.0 (2026-02-20)
- Initial API release
- Listings CRUD
- Rentals booking
- Token economy
- AI fair pricing

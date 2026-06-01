# Lume Refillery - System Architecture

This document maps out the core data flow and architectural dependencies of the Lume Refillery platform. 
Our primary focus is ensuring decoupling and resilience, meaning no single external provider going down will take down the entire system.

## High-Level Architecture

The system is broken down into four main pillars:
1. **Next.js (Client & SSR):** Handles the UI, edge-caching for the product catalog, and checkout session generation.
2. **Clerk (Identity):** Manages user authentication and JWT session tokens.
3. **Convex (Database & Logic):** The source of truth for inventory, user profiles, and subscription data.
4. **Stripe (Billing):** Handles PCI-compliant checkout and recurring billing.

### Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant N as Next.js (Frontend)
    participant C as Clerk (Auth)
    participant DB as Convex (Backend)
    participant S as Stripe (Billing)

    %% Authentication Flow
    Note over U,C: 1. Authentication
    U->>C: Login / Signup
    C-->>U: JWT Session Token
    C-->>DB: Webhook (user.created)
    DB->>DB: Upsert User Record

    %% Browsing & Shopping
    Note over U,DB: 2. Browsing Catalog
    U->>N: Load Shop Page
    N->>DB: Query Products (Cached via ISR)
    DB-->>N: Product Data
    N-->>U: Render Shop UI

    %% Checkout Flow
    Note over U,S: 3. Checkout (Decoupled)
    U->>N: Click "Subscribe"
    N->>S: Create Checkout Session API (Server)
    S-->>N: Session URL
    N-->>U: Redirect to Stripe Checkout
    
    %% Webhook Processing (Async)
    Note over S,DB: 4. Async Webhook Queue
    U->>S: Completes Payment
    S-->>DB: Webhook (checkout.session.completed)
    DB->>DB: Record Event & Return 200 OK immediately
    DB->>DB: Background Worker: Process Event
    DB->>DB: Update Subscriptions / Generate Boxes
```

## Resilience & Fallbacks

- **Stripe Downtime:** Because webhooks are ingested directly into an async Convex queue (`webhookEvents`), if our background processing fails (or if Stripe takes too long), we never time-out the Stripe webhook. Failed events stay in the queue to be manually or automatically retried.
- **Frontend Degradation:** The UI uses `<ErrorBoundary>` components around checkout features. If Stripe's API is unreachable from the client, the UI falls back to a graceful error state rather than crashing the shop.
- **Product Catalog Caching:** The product catalog is fetched via Convex but can be cached at the Next.js edge level using ISR (Incremental Static Regeneration). This prevents our database from being hammered by read requests during a traffic spike.

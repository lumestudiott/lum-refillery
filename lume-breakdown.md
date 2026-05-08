# Lume Refillery - Project Breakdown

## What is Lume Refillery?
Lume Refillery is a thoughtfully sourced, subscription-based grocery delivery platform. It is designed to provide "Reliable grocery subscriptions, thoughtfully built for everyday tables." Instead of standard grocery delivery, Lume categorizes groceries into specific "Hauls" (ranging from basic caloric essentials to premium/gourmet items and bulk orders) and delivers them on a fortnightly, monthly, or yearly schedule. 

The service emphasizes tailored provisions for different types of households, caloric needs, and culinary preferences, complete with transparent substitution policies for each haul type.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **UI & Styling:** React 18, Tailwind CSS, Framer Motion (for animations), Lucide React (for icons)
- **Authentication:** Clerk (`@clerk/nextjs` v6)
- **Backend/Database:** Convex (`convex` v1.31)
- **Language:** TypeScript

## Core Features
1. **Subscription Hauls:** Pre-curated grocery packages tailored to specific household needs, ranging from a "Supported Haul" to a "Gourmet Haul".
2. **Flexible Billing:** Fortnightly, monthly, or yearly pricing models for subscriptions.
3. **Substitution Policies:** Each tier has a strictly defined policy mapping exactly what happens if an item is out of stock (e.g., "Strict Caloric Match" vs "Artisan Quality Only").
4. **Gifting System:** Users can gift a subscription.
5. **User Dashboard:** For managing active subscriptions and account details, heavily reliant on Clerk's authentication and Convex's realtime data syncing.
6. **Sample Hauls Viewer:** A transparency feature allowing prospective users to view past or example hauls before subscribing.

## The Subscription Tiers
The system defines the following specific tiers (found in `src/data/tiers.ts`):

1. **Supported Haul:** ($35/mo) A care package for those in need. Focused on maximum caloric density and utility per dollar. *(Substitution Policy: Strict Caloric Match)*
2. **Essential Haul:** ($49/mo) The absolute basics for a small household (e.g., rice, flour, oil, sugar, pasta, beans, salt).
3. **Household Haul:** ($89/mo) Designed for families. Larger quantities of staples plus comfort items like coffee and tea.
4. **Premium Haul:** ($129/mo) Elevated essentials with organic options and specialty items (e.g., Extra Virgin Olive oil, Raw honey).
5. **Gourmet Haul:** ($179/mo) Curated selection of premium ingredients and specialty items for culinary enthusiasts (e.g., Arborio rice, Truffle oil, Saffron).
6. **Bulk Commercial:** ($249/mo) Large quantities for restaurants, cafes, or large families to reach maximum value per unit.

## Project Structure
- `/src/app`: Contains the main Next.js App Router routing logic for individual pages (Home, Dashboard, Sample Hauls, Gift, etc.).
- `/src/components`: Shared React UI components (`Hero.tsx`, `About.tsx`, `HowItWorks.tsx`, `TiersDisplay.tsx`) enriched with Framer Motion layout animations.
- `/src/data`: Holds static domain logic such as the `tiers.ts` data modeling the subscription payloads.
- `/convex`: Contains the Convex backend logic, serverless functions, and the platform's database schema.

## Design Aesthetic
The site utilizes a premium, organic UI leveraging `emerald` color tones, warm `stone` backgrounds, and a blend of serif typography for headings to convey a curated, trustworthy identity. Smooth animations with Framer Motion complement the premium, reliable branding.

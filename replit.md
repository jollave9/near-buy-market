# NearBuy - Location-Based Marketplace

## Overview
NearBuy is a full-stack web application built with Next.js 14 (App Router), TypeScript, Supabase, Tailwind CSS, and Shadcn UI. It's a location-based marketplace where users can buy and sell products nearby.

## Key Features
- **Unified Authentication**: Simple login system for all users (buyers and sellers)
- **Product Listings**: Users can create listings with images, title, description, price, and category
- **Location-Based Browsing**: Products are sorted by proximity to the user's location
- **Grid/List View**: Main feed shows products in a grid with distance information
- **TikTok-Style Detail View**: Vertical scroll interface when viewing individual products
- **In-App Messaging**: Real-time messaging between buyers and sellers
- **User Dashboard**: Manage your own product listings
- **Search & Filters**: Browse by category and search for specific items

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Forms**: React Hook Form with Zod validation
- **Utilities**: date-fns for date formatting

## Project Structure
```
/app - Next.js App Router pages and layouts
/components - Reusable React components
/lib - Library configurations (Supabase client)
/types - TypeScript type definitions
/utils - Utility functions (distance calculation, categories)
```

## Database Schema
- **profiles**: User profile information
- **products**: Product listings with location data
- **conversations**: Chat conversations between buyers and sellers
- **messages**: Individual messages within conversations
- **storage**: Product images stored in Supabase Storage

## Environment Variables
Required environment variables (see .env.example):
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Setup Instructions
1. Create a Supabase project at https://supabase.com
2. Run the SQL schema in `supabase-schema.sql` in your Supabase SQL editor
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
4. Run `npm install` to install dependencies
5. Run `npm run dev` to start the development server

## Development
- Development server runs on port 5000
- The app uses Supabase Row Level Security (RLS) for data access control
- Geolocation API is used to get user's current location for proximity sorting

## Recent Changes (November 1, 2025)
- ✅ Complete NearBuy marketplace application built and deployed
- ✅ Implemented authentication system with login/signup pages
- ✅ Created product listing form with image upload to Supabase Storage
- ✅ Built main feed with grid view and proximity-based sorting
- ✅ Implemented TikTok-style vertical scroll product detail view
- ✅ Added real-time messaging system using Supabase Realtime
- ✅ Created user dashboard for managing listings (activate/deactivate/delete)
- ✅ Implemented search and category filtering functionality
- ✅ Configured workflow and verified app runs without errors
- ✅ All features reviewed and validated by architect

## Important Setup Step
⚠️ **Before using the app, you MUST run the database schema:**
1. Go to your Supabase dashboard → SQL Editor
2. Copy all content from `supabase-schema.sql`
3. Paste and run it to create tables, policies, and storage bucket

See `SETUP.md` for detailed instructions.

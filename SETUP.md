# NearBuy Setup Instructions

## Database Setup

You need to run the SQL schema in your Supabase project to create all necessary tables and policies.

### Steps:

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire content from `supabase-schema.sql` file
5. Paste it into the SQL Editor
6. Click **Run** to execute the SQL

This will create:
- `profiles` table for user information
- `products` table for product listings
- `conversations` table for chat conversations
- `messages` table for messages
- `product-images` storage bucket for product images
- All necessary Row Level Security (RLS) policies
- Indexes for optimal performance

### Verify Setup

After running the SQL, you should see these tables in your Supabase dashboard under **Table Editor**:
- profiles
- products
- conversations
- messages

And this storage bucket under **Storage**:
- product-images

## Environment Variables

The following environment variables are already configured in Replit Secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Running the App

The app is already running! You can access it at the preview URL.

## Features

1. **Authentication**: Sign up and login functionality
2. **Browse Products**: View products sorted by proximity
3. **Create Listings**: Upload images and create product listings
4. **TikTok-Style View**: Swipe through products vertically
5. **Messaging**: Real-time chat between buyers and sellers
6. **Dashboard**: Manage your listings

## Location Permissions

The app requires location permissions to:
- Sort products by proximity
- Save your location when creating listings

Make sure to allow location access when prompted by your browser.

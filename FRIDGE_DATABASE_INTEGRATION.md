# Fridge Database Integration

## Overview

The refrigerator system is now connected to the database and can display and interact with food listings from the backend API.

## Features

### Database Integration
- **Real-time listings**: Fridge displays listings from the database that match the building ID
- **Auto-refresh**: Data refreshes every 30 seconds or when opening the fridge
- **Visual indicators**: Different colors and labels distinguish database listings from manual items

### Player Interactions

#### For All Players (Visitors and Residents):
- **C**: Claim an available listing
- **X**: Complete a claimed listing (awards points)
- **↑/↓**: Navigate through items
- **ESC**: Close fridge

#### For Residents Only:
- **A**: Add a random local item to fridge
- **P**: Create a sample listing (uploads to database)
- **D**: Delete selected manual item (cannot delete database listings)
- **E**: Open fridge (when near one)

### Visual System

#### Item Colors:
- **Light Blue**: Database listings (available)
- **Gray**: Claimed listings
- **Light Green**: Completed listings
- **Red**: Items expiring soon
- **White**: Manual items added locally

#### Status Indicators:
- **📋 LISTING**: Shows this is a database listing
- **[AVAILABLE]**, **[CLAIMED]**, **[COMPLETED]**: Status labels
- **⚠️ Expires in X days**: Expiration warnings

## API Integration

### Backend Requirements
Make sure your backend is running on `http://localhost:5000` with the following endpoints:
- `GET /listings` - Get all listings
- `POST /listings` - Create new listing
- `POST /listings/photo/sample` - Create listing with sample photo
- `PUT /listings/:id/claim` - Claim a listing
- `PUT /listings/:id/complete` - Complete a listing

### Environment Configuration
Set `NEXT_PUBLIC_API_URL` environment variable if your backend runs on a different URL.

## Database Schema

The system expects listings to have these fields:
```typescript
interface Listing {
  id: string;
  item_name: string;
  photo_url?: string;
  apartment_number?: string;
  building_number?: string;
  days_to_expiry?: number;
  status: 'available' | 'claimed' | 'completed';
  building_id: string;
  user_id: string;
  owner_name?: string;
  created_at: string;
}
```

## Testing the Integration

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the flow**:
   - Navigate to a fridge in the game (Edge or Tech Terrace apartments)
   - Press **E** to open the fridge
   - Press **P** to create a sample listing (if you're a resident)
   - Press **C** to claim a listing
   - Press **X** to complete a claimed listing
   - Observe the UI updates showing status changes

## Error Handling

- If the backend is unavailable, the fridge will show local items only
- Failed API calls are logged to the console
- The UI gracefully handles loading states

## Architecture

- **ApiService**: Handles all HTTP requests to backend
- **FridgeManager**: Manages fridge state and integrates local + database items
- **Player**: Handles input and user interactions
- **GameEngine**: Orchestrates the rendering loop

The integration maintains backward compatibility - fridges work offline with local items if the database is unavailable.

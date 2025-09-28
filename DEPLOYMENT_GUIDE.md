# Foodiverse Vercel Deployment Guide

Your Foodiverse project has been successfully converted for full-stack deployment on Vercel! Here's everything you need to know:

## What Was Changed

### 1. Backend Conversion
- ✅ Converted all Express.js routes to Vercel serverless functions
- ✅ Created optimized database connection pooling for serverless
- ✅ Replaced Server-Sent Events with polling-based updates
- ✅ Updated CORS configuration for production

### 2. Frontend Updates
- ✅ Updated API service to use relative paths (`/api`)
- ✅ Modified RealtimeService to use polling instead of SSE
- ✅ Added required backend dependencies to package.json

### 3. Configuration Files
- ✅ Created `vercel.json` with proper routing and environment setup
- ✅ Optimized database connections for serverless functions

## Deployment Steps

### 1. Environment Variables
You need to set these environment variables in your Vercel dashboard:

**Required for Jake to work:**
- `GEMINI_API_KEY` - Get this from [Google AI Studio](https://makersuite.google.com/app/apikey)

**Required for database features:**
- `DATABASE_URL` - PostgreSQL connection string (format: `postgresql://username:password@host:port/database_name`)
- `JWT_SECRET` - A secure random string for JWT token signing

### 2. Deploy to Vercel

✅ **Already deployed!** Your app is live at:
**Production URL:** `https://foodiverse-9m4he2dld-sungs-projects-82843355.vercel.app`

#### To redeploy with updates:
```bash
cd /home/sungoh/Personal/foodiverse/frontend
vercel --prod
```

#### To set environment variables:
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your "foodiverse" project
3. Go to Settings → Environment Variables
4. Add the required variables listed above

### 3. Database Setup
Make sure your PostgreSQL database is accessible from the internet. Popular options:
- **Supabase** (recommended) - Free tier with great Vercel integration
- **Railway** - Simple PostgreSQL hosting
- **PlanetScale** - Serverless MySQL alternative
- **Neon** - Serverless PostgreSQL

## API Endpoints

Your API will be available at:
- `https://your-app.vercel.app/api/auth/login`
- `https://your-app.vercel.app/api/auth/register`
- `https://your-app.vercel.app/api/listings`
- `https://your-app.vercel.app/api/leaderboard`
- `https://your-app.vercel.app/api/recipes/suggest`
- `https://your-app.vercel.app/api/jake/chat`
- `https://your-app.vercel.app/api/db-test`

## Important Changes

### Real-time Updates
- **Before**: Server-Sent Events for live updates
- **After**: Polling every 30 seconds (serverless-friendly)
- **Impact**: Slightly less real-time, but more reliable in serverless

### Database Connections
- Optimized connection pooling for serverless functions
- Automatic connection cleanup to prevent timeouts

### File Uploads
- Currently uses photo URLs (no server-side file storage needed)
- For future file uploads, consider using Vercel Blob or Cloudinary

## Testing Your Deployment

1. **Health Check**: Visit `/api/db-test` to verify database connectivity
2. **API Test**: Try `/api/listings/health` for API status
3. **Frontend**: Your main app should load and connect to the API automatically

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is set correctly
   - Ensure your database allows external connections
   - Check if your database is in the same region as Vercel functions

2. **API Not Found (404)**
   - Verify `vercel.json` is in the project root
   - Check that API files are in `frontend/api/` directory

3. **CORS Errors**
   - API functions include CORS headers
   - If issues persist, check browser developer tools

4. **Environment Variables**
   - Set in Vercel dashboard under Project Settings > Environment Variables
   - Redeploy after adding new environment variables

## Performance Optimization

- Functions have 30-second timeout (configurable in `vercel.json`)
- Database connections are optimized for serverless
- Polling interval can be adjusted in `RealtimeService.ts`

## Next Steps

1. Deploy to Vercel
2. Set up your environment variables
3. Test all functionality
4. Monitor function logs in Vercel dashboard
5. Consider upgrading to Vercel Pro for better performance if needed

Your app is now ready for production deployment on Vercel! 🚀

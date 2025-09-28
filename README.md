# 🍕 Foodiverse

**Foodiverse** is an interactive pixel-art campus world designed to help students discover and share food resources like community fridges and mutual-aid listings. Built with accessibility and inclusivity at its core, Foodiverse creates a welcoming digital space for food security on campus.

## ✨ Features

### 🎮 Interactive Campus World
- **Pixel-art style game** with keyboard-first navigation
- **Campus exploration** with multiple buildings and locations
- **Real-time interactions** with NPCs and community resources
- **Character customization** with inclusive options

### 🥘 Community Food Resources
- **Community fridge tracking** - find available food near you
- **Mutual-aid listings** - share and discover food resources
- **Real-time updates** via Server-Sent Events
- **Interactive leaderboard** for community engagement

### ♿ Accessibility & Inclusion
- **ARIA live regions** for screen reader support
- **Keyboard-only navigation** throughout the entire app
- **High-contrast mode** toggle for visual accessibility
- **Inclusive character creation** with pronouns and gender options
- **DEI-focused design** with community-centric approach

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **pnpm** (recommended package manager)
- **PostgreSQL** database

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd foodiverse
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update your `.env` file with:
   ```bash
   # Database
   DATABASE_URL=your_postgres_connection_string
   
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000
   
   # Authentication (if applicable)
   JWT_SECRET=your_jwt_secret
   
   # Google AI (for Jake assistant)
   GOOGLE_AI_API_KEY=your_google_ai_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** with App Router and Turbopack
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Canvas-based rendering** for pixel-art game world
- **HTML5 Canvas** for game graphics and interactions

### Backend & APIs
- **Next.js API Routes** for serverless functions
- **PostgreSQL** database with `pg` driver
- **Server-Sent Events (SSE)** for real-time updates
- **JWT authentication** with bcryptjs
- **Google Generative AI** integration for Jake assistant

### Deployment & Tools
- **Vercel** for hosting and deployment
- **ESLint** for code linting
- **TypeScript** for type safety
- **pnpm** for efficient package management

## 📁 Project Structure

```
foodiverse/
├── app/
│   ├── components/          # React components
│   │   ├── Game.tsx        # Main game loop and canvas
│   │   ├── Player.ts       # Player character logic
│   │   ├── World.ts        # Game world management
│   │   └── campus/         # Campus building interiors
│   ├── api/                # API routes
│   │   ├── listings/       # Food listing CRUD operations
│   │   ├── auth/          # Authentication endpoints
│   │   └── jake/          # AI assistant endpoints
│   ├── services/          # Frontend services
│   │   ├── ApiService.ts  # API communication
│   │   └── RealtimeService.ts # SSE handling
│   └── lib/               # Utilities and database
├── public/                # Static assets
├── vercel.json           # Vercel deployment config
└── package.json          # Dependencies and scripts
```

## 🎯 Key Components

### Game Engine
- **`Game.tsx`** - Main game loop, canvas rendering, and input handling
- **`Player.ts`** - Character movement, interactions, and state management
- **`World.ts`** - Scene management and world state
- **`SceneManager.ts`** - Handles transitions between different areas

### Campus Locations
- **Dining Areas** - Squires, Burrus, Turner, Torgersen
- **Off-Campus** - Food Lion, local restaurants, community spaces
- **Interactive NPCs** - Jake (AI assistant), bartenders, community members

### Real-time Features
- **Server-Sent Events** for live updates on food listings
- **Leaderboard system** with real-time score updates
- **Community engagement** tracking and notifications

## 🔧 Development

### Available Scripts

```bash
# Development with Turbopack (faster builds)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

### Environment Setup

For local development, ensure you have:
1. PostgreSQL database running
2. Environment variables configured
3. Google AI API key (for Jake assistant features)

## 🚀 Deployment

This project is optimized for **Vercel deployment**:

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on every push to main branch

The `vercel.json` configuration ensures:
- API routes have appropriate timeout settings
- Optimized build and deployment process

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Mobile-responsive design
- [ ] Enhanced accessibility features
- [ ] Additional campus locations
- [ ] Social features and user profiles
- [ ] Notification system for new listings
- [ ] Integration with campus dining services

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with accessibility and inclusion as core principles
- Inspired by the need for better food security resources on campus
- Thanks to the open-source community for the amazing tools and libraries

---

**Made with ❤️ for the campus community**
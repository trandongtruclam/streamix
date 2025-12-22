# Streamix

A modern, full-featured live streaming platform built with Next.js, React, and LiveKit. Streamix enables users to broadcast live video content, interact with viewers through chat, manage their streams, and grow their community.

## 🚀 Features

### Core Functionality

- **Live Streaming**: Browser-based broadcasting and RTMP/WHIP support for OBS and other streaming software
- **Real-time Chat**: Interactive chat with moderation controls (followers-only mode, delayed messages)
- **User Authentication**: Secure JWT-based authentication system with session management
- **Follow System**: Follow and unfollow creators to build your community
- **Block System**: Block users to maintain a safe streaming environment
- **Stream Management**: Configure stream keys, thumbnails, and stream settings
- **Video on Demand (VOD)**: Watch recorded streams after they end
- **Search**: Discover streams and creators
- **Analytics**: Track your stream performance and viewer metrics

### Streaming Features

- **Browser Broadcast**: Stream directly from your browser without additional software
- **OBS/RTMP Support**: Use professional streaming software with RTMP or WHIP protocols
- **Screen Sharing**: Share your screen with viewers
- **Multi-Quality Streaming**: Automatic quality adjustment and manual quality selection
- **Live Reactions**: Real-time viewer reactions (hearts, thumbs up, party, fire, star, etc.)
- **Recording**: Record your streams for later viewing
- **Restreaming**: Simultaneously stream to multiple platforms (YouTube, Twitch, Facebook Live)
- **Chat Controls**: Enable/disable chat, set follower-only mode, and delay messages

### User Experience

- **Modern UI**: Beautiful, responsive dark-themed interface built with Tailwind CSS and Radix UI
- **Real-time Updates**: Live viewer counts, stream status, and chat updates
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: Built with accessibility best practices

## 🛠️ Tech Stack

### Frontend

- **Next.js 16**: React framework with App Router
- **React 19**: Latest React features
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **LiveKit Components**: Pre-built streaming UI components
- **Zustand**: Lightweight state management
- **TanStack Query**: Data fetching and caching
- **Framer Motion**: Smooth animations
- **Lucide React**: Beautiful icons

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Robust relational database
- **LiveKit Server SDK**: Real-time video infrastructure
- **JWT**: Secure authentication tokens

### Infrastructure & Tools

- **Docker**: Containerization support
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Sharp**: Image optimization

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20 or higher
- **npm**, **yarn**, **pnpm**, or **bun**
- **PostgreSQL** database (local or hosted)
- **LiveKit Cloud** account or self-hosted LiveKit server

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd client
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/streamix?schema=public"

   # Authentication
   JWT_SECRET="your-super-secret-jwt-key-here"
   PASSWORD_SALT="your-password-salt-here"
   SESSION_COOKIE_NAME="streamix_session"

   # LiveKit Configuration
   LIVEKIT_API_URL="wss://your-livekit-server.com"
   LIVEKIT_API_KEY="your-livekit-api-key"
   LIVEKIT_API_SECRET="your-livekit-api-secret"

   # Next.js
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Optional: File Upload (UploadThing)
   UPLOADTHING_SECRET="your-uploadthing-secret"
   UPLOADTHING_APP_ID="your-uploadthing-app-id"
   NEXT_PUBLIC_UPLOADTHING_URL="https://your-uploadthing-url.com"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init

   # (Optional) Open Prisma Studio to manage your data
   npx prisma studio
   ```

5. **Configure LiveKit Webhooks**

   In your LiveKit dashboard, configure webhooks to point to:

   ```
   https://your-domain.com/api/webhooks/livekit
   ```

   The webhook handles:

   - Stream start/end events
   - Participant join/leave events
   - Track publish/unpublish events

6. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
streamix/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                     # Static assets
├── src/
│   ├── actions/               # Server actions
│   │   ├── block.ts           # User blocking
│   │   ├── follow.ts          # Follow/unfollow
│   │   ├── ingress.ts         # Stream ingress management
│   │   ├── recording.ts       # Stream recording
│   │   ├── stream.ts          # Stream operations
│   │   ├── token.ts           # Viewer tokens
│   │   └── user.ts            # User operations
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (browse)/          # Public browsing routes
│   │   │   ├── [username]/    # User profile/stream page
│   │   │   ├── search/        # Search functionality
│   │   │   └── (home)/        # Home feed
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   └── u/[username]/  # Creator dashboard
│   │   │       ├── stream/    # Browser broadcasting
│   │   │       ├── keys/      # Stream keys management
│   │   │       ├── chat/      # Chat management
│   │   │       ├── analytics/ # Stream analytics
│   │   │       └── community/ # Community management
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── webhooks/      # LiveKit webhooks
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── stream-player/     # Stream player components
│   │   ├── ui/                # Reusable UI components
│   │   └── ...                # Other components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── prisma.ts          # Prisma client
│   │   ├── constants.ts       # Application constants
│   │   └── ...                # Service files
│   ├── store/                 # Zustand stores
│   └── middleware.ts          # Next.js middleware
├── generated/                 # Generated files (Prisma)
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main models:

- **User**: User accounts with authentication
- **Stream**: Stream configuration and status
- **Follow**: User follow relationships
- **Block**: User block relationships
- **Session**: Active user sessions

See `prisma/schema.prisma` for the complete schema definition.

## 🔐 Authentication

Streamix uses a JWT-based authentication system with:

- Secure password hashing (SHA-256 with salt)
- HTTP-only cookies for session management
- Session expiration (configurable, default: 7 days)
- Middleware-based route protection

### Protected Routes

- Dashboard routes (`/u/[username]/*`)
- Stream management pages
- User settings

### Public Routes

- Home page
- User profile pages (`/[username]`)
- Sign in/Sign up pages
- Search page

## 📡 Streaming Setup

### Browser Broadcasting

1. Navigate to your dashboard: `/u/[username]/stream`
2. Click "Go Live"
3. Allow camera/microphone permissions
4. Start streaming!

### OBS/RTMP Setup

1. Navigate to your dashboard: `/u/[username]/keys`
2. Generate RTMP or WHIP ingress credentials
3. Configure OBS:
   - **Server**: Use the provided server URL
   - **Stream Key**: Use the generated stream key
4. Click "Start Streaming" in OBS

### Restreaming

Streamix supports simultaneous streaming to:

- YouTube Live
- Twitch
- Facebook Live
- Custom RTMP endpoints

Configure restream destinations in the dashboard under stream settings.

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

### Docker

```bash
# Build the image
docker build -t streamix .

# Run the container
docker run -p 3000:3000 --env-file .env streamix
```

### Manual Deployment

```bash
# Build the production bundle
npm run build

# Start the production server
npm start
```

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Check code formatting
- `npm run format:fix` - Fix code formatting

## 🔧 Configuration

### Environment Variables

| Variable              | Description                    | Required |
| --------------------- | ------------------------------ | -------- |
| `DATABASE_URL`        | PostgreSQL connection string   | Yes      |
| `JWT_SECRET`          | Secret key for JWT tokens      | Yes      |
| `PASSWORD_SALT`       | Salt for password hashing      | Yes      |
| `LIVEKIT_API_URL`     | LiveKit server WebSocket URL   | Yes      |
| `LIVEKIT_API_KEY`     | LiveKit API key                | Yes      |
| `LIVEKIT_API_SECRET`  | LiveKit API secret             | Yes      |
| `NEXT_PUBLIC_APP_URL` | Public URL of your application | Yes      |
| `UPLOADTHING_SECRET`  | UploadThing secret (optional)  | No       |
| `UPLOADTHING_APP_ID`  | UploadThing app ID (optional)  | No       |

## 📚 Key Technologies & Libraries

- **LiveKit**: Real-time video infrastructure
- **Prisma**: Next-generation ORM for TypeScript
- **Radix UI**: Unstyled, accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Minimal state management
- **TanStack Query**: Powerful data synchronization
- **Sonner**: Beautiful toast notifications
- **date-fns**: Date utility library

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database credentials

### LiveKit Connection Issues

- Verify LiveKit server is accessible
- Check `LIVEKIT_API_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`
- Ensure webhooks are properly configured

### Build Errors

- Run `npx prisma generate` to regenerate Prisma Client
- Clear `.next` folder and rebuild
- Check Node.js version (requires 20+)

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [LiveKit Documentation](https://docs.livekit.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📧 Support

For support, please open an issue in the repository.

---

Built with ❤️ using Next.js, React, and LiveKit

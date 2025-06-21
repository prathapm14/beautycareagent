# AI-Powered Skincare App - Replit Configuration

## Overview

This is a mobile-first AI-powered skincare application that delivers personalized routines through intuitive user input (text, voice, images). The app prioritizes simplicity, personalization, and accessibility for users seeking customized skincare guidance.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: React Query (TanStack Query) for server state management
- **Real-time Communication**: WebSocket connection for live multiplayer features

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **WebSocket**: Built-in WebSocket server for real-time communication
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Session-based player tracking
- **Storage**: Configurable storage interface with in-memory implementation

## Key Components

### Database Schema (Drizzle ORM)
- **Game Rooms**: Stores room codes, current word, word chains, and game state
- **Players**: Tracks player names, room associations, ready status, and host privileges
- **Type Safety**: Full TypeScript integration with Zod schema validation

### Real-time Communication
- **WebSocket Server**: Handles room creation, joining, and game events
- **Message Types**: Structured message protocol for game actions
- **Broadcast System**: Efficient room-based message distribution
- **Connection Management**: Automatic reconnection and error handling

### Frontend Pages
- **Home Page**: Room creation and joining interface
- **Game Room**: Main game interface with word input and chain display
- **404 Page**: Error handling for invalid routes

### UI Components
- **shadcn/ui**: Complete component library with consistent design
- **Help Modal**: Game instructions and examples
- **Toast Notifications**: User feedback for actions and errors
- **Responsive Design**: Mobile-first approach with breakpoint considerations

## Data Flow

1. **Game Creation**: Host creates room → generates unique code → stores in database
2. **Player Joining**: Players join via room code → WebSocket connection established
3. **Game State**: Real-time synchronization of word chains and player turns
4. **Word Submission**: Player submits word → validation → broadcast to all players
5. **Turn Management**: Automatic progression through player order

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **ws**: WebSocket implementation for real-time features

### UI Dependencies
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **cmdk**: Command palette functionality

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production builds
- **drizzle-kit**: Database migration and schema management

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations managed via `db:push` command

### Environment Setup
- **NODE_ENV**: Controls development/production behavior
- **DATABASE_URL**: PostgreSQL connection string (required)
- **Port Configuration**: Server runs on port 5000, proxied to port 80

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Autoscale Deployment**: Handles traffic scaling automatically
- **Development**: Hot reload with Vite development server
- **Production**: Optimized builds with static asset serving

## Changelog

```
Changelog:
- June 21, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
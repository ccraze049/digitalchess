# Overview

This is a full-stack web application built as a chess game with both 2D interface and 3D rendering capabilities. The application features a React frontend with TypeScript, an Express.js backend, and uses Drizzle ORM with PostgreSQL for data persistence. The chess game includes AI opponents with multiple difficulty levels, real-time gameplay, audio feedback, and a comprehensive UI built with Radix UI components and Tailwind CSS.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client uses a modern React setup with TypeScript and Vite as the build tool. The UI is component-based using Radix UI primitives with custom styling via Tailwind CSS. State management is handled through Zustand stores for different aspects of the application:

- **Chess Game State**: Manages board state, moves, game logic, and AI interactions
- **Audio State**: Controls sound effects and background music with mute functionality
- **Game Phase State**: Tracks overall game progression (ready, playing, ended)

The frontend includes comprehensive chess game components including a draggable chess board, piece rendering with Unicode symbols, move history tracking, and game timer functionality. The architecture supports both 2D traditional chess gameplay and has foundations for 3D rendering using React Three Fiber.

## Backend Architecture

The server uses Express.js with TypeScript in ESM format. The application follows a modular route structure with a storage abstraction layer that currently implements in-memory storage but is designed to support database integration. The backend includes:

- **Route Registration**: Centralized route management with API prefix structure
- **Storage Interface**: Abstracted data layer supporting CRUD operations for users
- **Development Integration**: Vite middleware integration for development hot reloading

The server is configured for production deployment with proper error handling and request logging middleware.

## Data Storage Solutions

The application uses Drizzle ORM configured for PostgreSQL with migrations support. The database schema currently defines a users table with username/password authentication structure. The storage system uses an interface pattern allowing for easy switching between in-memory storage (for development) and PostgreSQL (for production).

Database configuration is environment-based using DATABASE_URL, ensuring secure credential management across different deployment environments.

## Chess Game Logic

The chess engine implements complete game rules including:

- **Move Validation**: Comprehensive piece movement rules and board state validation
- **AI Implementation**: Minimax algorithm with alpha-beta pruning for AI opponents
- **Game State Management**: Check, checkmate, and stalemate detection
- **Special Moves**: Support for castling, en passant, and pawn promotion
- **Move History**: Complete game notation and move tracking

The AI system supports three difficulty levels (easy, medium, hard) with different search depths, providing varied gameplay experiences.

## Audio System

The application includes a comprehensive audio management system with support for:

- Background music and sound effects
- Mute/unmute functionality with persistent state
- Event-driven audio triggers for game actions
- Audio file preloading for smooth gameplay

## 3D Rendering Capability

The frontend includes React Three Fiber integration with support for:

- 3D scene rendering with proper lighting
- GLSL shader support for advanced visual effects
- Asset loading for 3D models (GLTF, GLB formats)
- Post-processing effects pipeline

This provides the foundation for future 3D chess board implementations while maintaining the current 2D interface.

# External Dependencies

## Frontend Libraries

- **React Ecosystem**: React 18 with TypeScript, React Three Fiber for 3D rendering, and React Query for server state management
- **UI Framework**: Comprehensive Radix UI component library providing accessible primitives for modals, dropdowns, tooltips, and form controls
- **Styling**: Tailwind CSS with custom design system integration and PostCSS processing
- **State Management**: Zustand for client-side state with subscription-based reactivity
- **3D Graphics**: React Three Drei for 3D utilities and React Three Postprocessing for visual effects

## Backend Dependencies

- **Server Framework**: Express.js with TypeScript support and ESM module system
- **Database Integration**: Drizzle ORM with PostgreSQL adapter and Neon Database serverless driver
- **Session Management**: Express session handling with PostgreSQL session store (connect-pg-simple)
- **Development Tools**: TSX for TypeScript execution and hot reloading in development

## Build and Development Tools

- **Build System**: Vite with React plugin, TypeScript checking, and custom alias resolution
- **Code Quality**: TypeScript with strict mode enabled and comprehensive type checking
- **Database Migrations**: Drizzle Kit for schema migrations and database management
- **Development Experience**: Runtime error overlay and custom logging integration

## Third-Party Services

- **Database Hosting**: Configured for Neon Database serverless PostgreSQL with connection pooling
- **Audio Assets**: Local audio file serving for game sounds and background music
- **Font Loading**: Fontsource integration for consistent typography across devices

The application is designed for easy deployment to platforms like Replit with proper environment variable configuration and production build optimization.
# Overview

Letters For You is a web-based platform that enables users to write and share anonymous, heartfelt letters. The application allows users to express unsaid feelings and thoughts to someone who matters, browse letters from others, and maintain a local history of their own submissions. The platform emphasizes anonymity, community sharing, and emotional expression without requiring user authentication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Problem**: Need a responsive, client-side rendered application with routing and real-time interactivity.

**Solution**: React-based single-page application (SPA) using HashRouter for client-side routing, built with Vite as the build tool and TypeScript for type safety.

**Key Decisions**:
- **React 19** with functional components and hooks for state management
- **HashRouter** instead of BrowserRouter to handle routing without server configuration requirements
- **Tailwind CSS** (via CDN) for utility-first styling with custom font configuration (Inter and Hedvig Letters Serif)
- **Vite** as the development server and build tool for fast HMR and optimized production builds
- Component-based architecture with shared UI components (Header, Footer, LetterCard, icons)

**Pros**: Fast development, modern DX, easy deployment without server-side routing configuration
**Cons**: Hash-based URLs are less SEO-friendly (though mitigated by the anonymous nature of the platform)

## Data Storage Strategy

**Problem**: Need to store user-submitted letters securely while maintaining user anonymity and providing personal history tracking.

**Solution**: Hybrid storage approach using encrypted SQLite database for server-side persistence and browser localStorage for personal letter history.

**Key Decisions**:
- **SQLite Database** with AES-256-CBC encryption for all letter content
- **Server-side storage** via PHP API endpoints for publicly browsable letters
- **localStorage** for maintaining user's personal letter history (stored on client device only)
- **No user authentication** - all submissions are anonymous by design
- **Encryption Layer**: All letter content and recipient information encrypted at rest
- Letters include: id, to (recipient description), content, author (always "Anonymous" for public), and date

**Pros**: Secure encrypted storage, true anonymity, no user data collection, simple architecture
**Cons**: User history lost if localStorage is cleared, no cross-device synchronization

## API Architecture

**Problem**: Need backend endpoints for letter submission, retrieval, and admin moderation without complex authentication for regular users.

**Solution**: RESTful PHP 8.4 API with SQLite database, token-based admin authentication, and content moderation system.

**Backend Structure**:
- **Database**: SQLite with encrypted storage in `api/letters.db`
- **Encryption**: AES-256-CBC encryption for all letter content using environment-based key
- **Admin Auth**: Password-based authentication with bcrypt hashing
- **Default Admin Password**: `admin123` (should be changed via ADMIN_PASSWORD environment variable)

**API Client Structure** (`api-client.ts`):
- `getLetters()` - Fetch all public letters (GET /api/letters.php)
- `submitLetter()` - Submit new letter (POST /api/letters.php)
- `deleteLetter()` - Admin-only deletion with Bearer token (DELETE /api/letters.php)
- `adminLogin()` - Password-based admin authentication (POST /api/admin.php)
- `getModerationWords()` - Fetch blocked words list (admin-only)
- `addModerationWord()` - Add word to blocklist (admin-only)
- `deleteModerationWord()` - Remove word from blocklist (admin-only)

**Key Features**:
- **Content Moderation**: Word-based filtering system to prevent inappropriate content
- **Admin Panel**: Password-protected admin interface (`/admin` route) for letter management and moderation
- **Session-based Admin Auth**: Token stored in sessionStorage for admin session persistence
- **Encrypted Storage**: All sensitive data encrypted at rest in SQLite database

**Pros**: Secure encrypted storage, simple stateless API, easy moderation system, minimal infrastructure
**Cons**: PHP dependency; basic authentication mechanism; encryption key management required

## Client-Side Features

**Letter Download Functionality**:
- Uses **html2canvas** library (loaded via CDN) to capture letter content as image
- Generates styled, shareable letter images with background and formatting
- Client-side rendering ensures privacy (no server-side image generation)

**Search and Filtering**:
- Client-side search across letter recipients ("to" field) and content
- Real-time filtering using React useMemo for performance optimization

**UI/UX Patterns**:
- Skeleton loading states for better perceived performance
- Modal overlays for detailed letter viewing
- Responsive grid layouts (mobile-first design)
- Accessible keyboard navigation and ARIA attributes

## Development Environment

**Vite Configuration**:
- Dev server on port 5000 with HMR
- Proxy configuration routing `/api/*` requests to `http://localhost:8080` (PHP backend)
- Path aliasing (`@/*`) for cleaner imports
- React plugin for Fast Refresh support

**Build Process**:
- TypeScript compilation with React JSX transform
- ES2022 target for modern JavaScript features
- Module bundling and tree-shaking via Vite

# External Dependencies

## Frontend Dependencies

**Core Framework**:
- `react@^19.1.1` - UI library
- `react-dom@^19.1.1` - DOM rendering
- `react-router-dom@^7.9.3` - Client-side routing

**Build Tools**:
- `vite@^6.2.0` - Build tool and dev server
- `@vitejs/plugin-react@^5.0.0` - React Fast Refresh support
- `typescript@~5.8.2` - Type checking and compilation
- `@types/node@^22.14.0` - Node.js type definitions

## CDN-Loaded Libraries

**Styling**:
- Tailwind CSS (via CDN script in index.html)
- Google Fonts: Inter and Hedvig Letters Serif

**Utilities**:
- `html2canvas@1.4.1` - Client-side screenshot/image generation for letter downloads

**Module Resolution**:
- React and React Router loaded via import maps pointing to aistudiocdn.com

## Backend Dependencies

**Server Stack**:
- **PHP 8.4** runtime for API endpoints
- **SQLite** database for letter storage with encryption
- PHP built-in development server (dev) / production server for deployment

**API Endpoints**:
- `/api/letters.php` - Letter CRUD operations (GET, POST, DELETE with admin auth)
- `/api/admin.php` - Admin authentication
- `/api/moderation.php` - Moderation word management (admin-protected)

**Environment Variables**:
- `ENCRYPTION_KEY` - AES-256 encryption key for letter content (defaults to 'default-key-change-in-production')
- `ADMIN_PASSWORD` - Admin panel password (defaults to 'admin123')

## Third-Party Services

**Donations**:
- BuyMeACoffee integration (https://buymeacoffee.com/flaredmoko) for platform support
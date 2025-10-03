# Overview

Letters For You is a web-based platform that enables users to write and share anonymous, heartfelt letters. The application allows users to express unsaid feelings and thoughts to someone who matters, browse letters from others, and maintain a local history of their own submissions. The platform emphasizes anonymity, community sharing, and emotional expression without requiring user authentication.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (October 3, 2025)

**Environment Configuration (.env support)**: Added .env file support for easier hosting migration.
- System now reads from `.env` file first, then falls back to environment variables
- `.env.example` template provided with all required configuration variables
- `.env` added to `.gitignore` for security
- Simplifies deployment to external hosting providers

**Database-Backed Admin User Management**: Complete admin user management system with role-based permissions.
- Admins stored in MySQL `admins` table (username, password_hash, role, permissions)
- Four granular permission types: manage_letters, manage_moderation, manage_admins, manage_blog
- Default admin account created via `api/init_admin.php`: username "Flaredy", role "Owner", all permissions enabled
- Admin Users tab in admin panel for creating/editing/deleting admin accounts (requires manage_admins permission)
- Permission-based UI: tabs and features only shown if admin has required permissions

**Blog System with WYSIWYG Editor**: Full-featured blog system for publishing content.
- Blog posts stored in MySQL `blog_posts` table with title, content, slug, author, publish status
- Quill WYSIWYG editor (loaded from CDN) for rich text content creation
- Automatic slug generation from post titles with uniqueness enforcement
- Admin blog management page (`/blog-manage`) for creating/editing/publishing posts (requires manage_blog permission)
- Public blog pages: `/blog` (list view) and `/blog/:slug` (individual post view)
- Blog navigation link added to main header
- Posts attributed to admin authors (username + role displayed)

**MySQL Database Migration**: Migrated from SQLite to MySQL database for better scalability and production readiness.
- Updated database connection to use MySQL with PDO
- Configuration via .env file: MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD
- Tables now use InnoDB engine with utf8mb4 charset
- AES-256-CBC encryption for letter content

**Security Enhancements**:
- All admin passwords hashed with bcrypt (PASSWORD_BCRYPT)
- HMAC-SHA256 signed authentication tokens with 24-hour expiration
- Permission checks enforced on all admin API endpoints
- Database connection errors sanitized to prevent information leakage
- Admin role and permissions displayed in dashboard header

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

**Solution**: Hybrid storage approach using encrypted MySQL database for server-side persistence and browser localStorage for personal letter history.

**Key Decisions**:
- **MySQL Database** with AES-256-CBC encryption for all letter content
- **Production-ready database** using InnoDB engine with utf8mb4 character set
- **Server-side storage** via PHP API endpoints for publicly browsable letters
- **localStorage** for maintaining user's personal letter history (stored on client device only)
- **No user authentication** - all submissions are anonymous by design
- **Encryption Layer**: All letter content and recipient information encrypted at rest
- Letters include: id, to (recipient description), content, author (always "Anonymous" for public), and date

**Pros**: Secure encrypted storage, true anonymity, no user data collection, scalable database architecture
**Cons**: User history lost if localStorage is cleared, no cross-device synchronization, requires MySQL server

## API Architecture

**Problem**: Need backend endpoints for letter submission, retrieval, and admin moderation without complex authentication for regular users.

**Solution**: RESTful PHP 8.4 API with MySQL database, secure token-based admin authentication, and content moderation system.

**Backend Structure**:
- **Database**: MySQL with encrypted storage (InnoDB, utf8mb4)
- **Encryption**: AES-256-CBC encryption for all letter content using environment-based key
- **Admin Auth**: Username/password authentication with bcrypt hashing
- **Secure Tokens**: HMAC-SHA256 signed tokens with 24-hour expiration
- **Admin Database**: Admins stored in MySQL `admins` table with role-based permissions

**API Client Structure** (`api-client.ts`):
- `getLetters()` - Fetch all public letters (GET /api/letters.php)
- `submitLetter()` - Submit new letter (POST /api/letters.php)
- `deleteLetter()` - Admin-only deletion with Bearer token (DELETE /api/letters.php)
- `adminLogin(username, password)` - Username/password admin authentication (POST /api/admin.php)
- `getModerationWords()` - Fetch blocked words list (admin-only)
- `addModerationWord()` - Add word to blocklist (admin-only)
- `deleteModerationWord()` - Remove word from blocklist (admin-only)
- `getAdminUsers()` - Fetch all admin users (requires manage_admins permission)
- `createAdminUser()` - Create new admin (requires manage_admins permission)
- `updateAdminUser()` - Update admin details (requires manage_admins permission)
- `deleteAdminUser()` - Delete admin (requires manage_admins permission)
- `getBlogPosts()` - Fetch blog posts (public: published only; admin: all)
- `getBlogPost()` - Fetch single blog post by slug or ID
- `createBlogPost()` - Create blog post (requires manage_blog permission)
- `updateBlogPost()` - Update blog post (requires manage_blog permission)
- `deleteBlogPost()` - Delete blog post (requires manage_blog permission)

**Key Features**:
- **Content Moderation**: Word-based filtering system to prevent inappropriate content
- **Admin Panel**: Username/password-protected admin interface (`/admin` route) for letter management and moderation
- **Secure Token Auth**: HMAC-signed tokens with expiration stored in sessionStorage
- **Encrypted Storage**: All sensitive data encrypted at rest in MySQL database
- **Role-based Access**: Admin role and granular permission system with four permission types
- **Admin User Management**: Full CRUD operations for managing admin accounts with permission controls
- **Blog System**: Complete blog functionality with WYSIWYG editing and public/admin views

**Pros**: Secure encrypted storage, production-ready database, secure token authentication, granular permission system, easy moderation
**Cons**: Requires MySQL server; encryption key management required; token expiration requires re-login

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
- **MySQL** database for letter storage with encryption
- PHP built-in development server (dev) / production server for deployment

**API Endpoints**:
- `/api/letters.php` - Letter CRUD operations (GET, POST, DELETE with admin auth)
- `/api/admin.php` - Admin authentication with username/password
- `/api/moderation.php` - Moderation word management (admin-protected)
- `/api/admin_users.php` - Admin user CRUD operations (requires manage_admins permission)
- `/api/blog.php` - Blog post CRUD operations (public GET, admin mutations require manage_blog)
- `/api/init_admin.php` - Initialize default admin account (Flaredy) on first run

**Environment Variables** (configured via .env file or environment):
- `ENCRYPTION_KEY` - AES-256 encryption key for letter content and token signatures
- `MYSQL_HOST` - MySQL server hostname
- `MYSQL_DATABASE` - MySQL database name
- `MYSQL_USER` - MySQL username
- `MYSQL_PASSWORD` - MySQL password
- `ADMIN_USERNAME` - Legacy admin username (for initialization, now stored in database)
- `ADMIN_PASSWORD` - Legacy admin password (for initialization, now stored in database)

## Third-Party Services

**Donations**:
- BuyMeACoffee integration (https://buymeacoffee.com/flaredmoko) for platform support
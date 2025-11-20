# Technical Design Document

## Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web Browser │  │ Mobile PWA   │  │ Admin Panel  │      │
│  │  (Vite+React)│  │ (Installed)  │  │ (Dashboard)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │  HTTPS/WSS       │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Load Balancer / CDN                        │
│                    (Nginx / Cloudflare)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ App Server 1│  │ App Server 2│  │ App Server N│
│ (Node.js)   │  │ (Node.js)   │  │ (Node.js)   │
│ Express API │  │ Express API │  │ Express API │
│ Socket.io   │  │ Socket.io   │  │ Socket.io   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────┬───────┴────────┬───────┘
                │                │
       ┌────────▼────────┐  ┌────▼────────┐
       │   PostgreSQL    │  │    Redis    │
       │   (Primary DB)  │  │  (Cache/    │
       │                 │  │  Sessions)  │
       └─────────────────┘  └─────────────┘
                │
       ┌────────▼────────────────┐
       │  Cloud Storage          │
       │  (Images/Documents)     │
       │  Cloudinary / AWS S3    │
       └─────────────────────────┘

External Services:
├── Twilio (SMS)
├── SendGrid (Email)
├── OpenStreetMap (Map Tiles)
└── OAuth Providers (Google, Facebook)
```

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js v18+ LTS
- **Framework**: Express.js v4.18+
- **Language**: TypeScript 5.0+
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Caching**: Redis 7+
- **WebSocket**: Socket.io v4+
- **Authentication**: Passport.js + JWT

### Folder Structure
```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── passport.ts
│   │
│   ├── controllers/      # Request handlers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── missingPersonController.ts
│   │   ├── locationController.ts
│   │   ├── resourceController.ts
│   │   └── volunteerController.ts
│   │
│   ├── models/           # Prisma models (auto-generated)
│   │
│   ├── services/         # Business logic
│   │   ├── authService.ts
│   │   ├── emailService.ts
│   │   ├── smsService.ts
│   │   ├── storageService.ts
│   │   └── geocodingService.ts
│   │
│   ├── routes/           # API routes
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── missingPersonRoutes.ts
│   │   ├── locationRoutes.ts
│   │   ├── resourceRoutes.ts
│   │   └── volunteerRoutes.ts
│   │
│   ├── middleware/       # Custom middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimit.ts
│   │   └── upload.ts
│   │
│   ├── sockets/          # WebSocket handlers
│   │   ├── index.ts
│   │   ├── locationSocket.ts
│   │   ├── notificationSocket.ts
│   │   └── chatSocket.ts
│   │
│   ├── utils/            # Utility functions
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   └── constants.ts
│   │
│   ├── types/            # TypeScript type definitions
│   │
│   └── app.ts            # Express app setup
│
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── tsconfig.json
├── package.json
└── server.ts             # Entry point
```

### Database Schema (Prisma)
```prisma
// User authentication and profile
model User {
  id                String           @id @default(uuid())
  email             String           @unique
  passwordHash      String?
  fullName          String
  phoneNumber       String?
  profilePhotoUrl   String?
  emailVerified     Boolean          @default(false)
  role              Role             @default(USER)
  provider          AuthProvider     @default(LOCAL)
  providerId        String?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  lastLoginAt       DateTime?
  
  missingPersonReports MissingPerson[]
  resourcePosts        Resource[]
  resourceRequests     ResourceRequest[]
  volunteerProfile     Volunteer?
  locations            Location[]
  notifications        Notification[]
}

enum Role {
  USER
  COORDINATOR
  ADMIN
}

enum AuthProvider {
  LOCAL
  GOOGLE
  FACEBOOK
}

// Missing person reports
model MissingPerson {
  id                 String    @id @default(uuid())
  reporterId         String
  reporter           User      @relation(fields: [reporterId], references: [id])
  fullName           String
  age                Int?
  gender             Gender?
  photoUrls          String[]
  description        String
  lastKnownLocation  Location  @relation(fields: [locationId], references: [id])
  locationId         String
  lastSeenDate       DateTime
  contactInfo        String
  status             PersonStatus @default(MISSING)
  foundDate          DateTime?
  verificationStatus VerificationStatus @default(PENDING)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
}

enum Gender {
  MALE
  FEMALE
  OTHER
  UNKNOWN
}

enum PersonStatus {
  MISSING
  FOUND
  DECEASED
}

enum VerificationStatus {
  PENDING
  VERIFIED
  UNVERIFIED
}

// Location tracking
model Location {
  id             String       @id @default(uuid())
  latitude       Float
  longitude      Float
  address        String?
  locationType   LocationType
  description    String?
  reportedBy     User         @relation(fields: [userId], references: [id])
  userId         String
  status         LocationStatus @default(ACTIVE)
  capacity       Int?
  currentCount   Int?
  photoUrls      String[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  missingPersons MissingPerson[]
  resources      Resource[]
}

enum LocationType {
  SAFE_ZONE
  EVACUATION_CENTER
  HAZARD
  FLOODED_AREA
  RESOURCE_POINT
  USER_LOCATION
}

enum LocationStatus {
  ACTIVE
  INACTIVE
  FULL
  CLOSED
}

// Resource sharing
model Resource {
  id               String          @id @default(uuid())
  title            String
  description      String
  category         ResourceCategory
  quantity         Int
  quantityUnit     String
  location         Location        @relation(fields: [locationId], references: [id])
  locationId       String
  postedBy         User            @relation(fields: [userId], references: [id])
  userId           String
  contactInfo      String
  photoUrls        String[]
  availableFrom    DateTime        @default(now())
  availableUntil   DateTime?
  status           ResourceStatus  @default(AVAILABLE)
  verifiedOrg      Boolean         @default(false)
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  
  requests         ResourceRequest[]
}

enum ResourceCategory {
  FOOD_WATER
  MEDICAL_SUPPLIES
  CLOTHING_BEDDING
  SHELTER_SPACE
  TRANSPORTATION
  COMMUNICATION
  TOOLS_EQUIPMENT
  HYGIENE
  PET_SUPPLIES
  BABY_CHILD_NEEDS
}

enum ResourceStatus {
  AVAILABLE
  PARTIALLY_CLAIMED
  FULLY_CLAIMED
  EXPIRED
  REMOVED
}

model ResourceRequest {
  id          String         @id @default(uuid())
  requestedBy User           @relation(fields: [userId], references: [id])
  userId      String
  resource    Resource?      @relation(fields: [resourceId], references: [id])
  resourceId  String?
  category    ResourceCategory
  description String
  quantity    Int
  urgency     UrgencyLevel   @default(NORMAL)
  status      RequestStatus  @default(OPEN)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

enum UrgencyLevel {
  LOW
  NORMAL
  HIGH
  CRITICAL
}

enum RequestStatus {
  OPEN
  MATCHED
  FULFILLED
  CANCELLED
}

// Volunteer management
model Volunteer {
  id            String     @id @default(uuid())
  user          User       @relation(fields: [userId], references: [id])
  userId        String     @unique
  skills        String[]
  availability  Json       // Flexible schedule data
  maxRadius     Int        // km willing to travel
  verified      Boolean    @default(false)
  hoursLogged   Int        @default(0)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  assignments   VolunteerAssignment[]
}

model VolunteerOpportunity {
  id              String     @id @default(uuid())
  title           String
  description     String
  requiredSkills  String[]
  location        String
  startDate       DateTime
  endDate         DateTime
  volunteersNeeded Int
  createdAt       DateTime   @default(now())
  
  assignments     VolunteerAssignment[]
}

model VolunteerAssignment {
  id            String               @id @default(uuid())
  volunteer     Volunteer            @relation(fields: [volunteerId], references: [id])
  volunteerId   String
  opportunity   VolunteerOpportunity @relation(fields: [opportunityId], references: [id])
  opportunityId String
  status        AssignmentStatus     @default(PENDING)
  hoursWorked   Int?
  createdAt     DateTime             @default(now())
}

enum AssignmentStatus {
  PENDING
  ACCEPTED
  COMPLETED
  CANCELLED
}

// Notifications
model Notification {
  id        String           @id @default(uuid())
  user      User             @relation(fields: [userId], references: [id])
  userId    String
  type      NotificationType
  title     String
  message   String
  data      Json?
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())
}

enum NotificationType {
  MISSING_PERSON_FOUND
  RESOURCE_AVAILABLE
  VOLUNTEER_MATCH
  SAFETY_ALERT
  SYSTEM_UPDATE
}
```

### API Design

#### RESTful Endpoints

**Authentication**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
GET    /api/auth/google
GET    /api/auth/google/callback
```

**Users**
```
GET    /api/users/me
PUT    /api/users/me
PUT    /api/users/me/password
POST   /api/users/me/photo
DELETE /api/users/me
```

**Missing Persons**
```
GET    /api/missing-persons
POST   /api/missing-persons
GET    /api/missing-persons/:id
PUT    /api/missing-persons/:id
DELETE /api/missing-persons/:id
PUT    /api/missing-persons/:id/status
GET    /api/missing-persons/search
```

**Locations**
```
GET    /api/locations
POST   /api/locations
GET    /api/locations/:id
PUT    /api/locations/:id
DELETE /api/locations/:id
GET    /api/locations/nearby
```

**Resources**
```
GET    /api/resources
POST   /api/resources
GET    /api/resources/:id
PUT    /api/resources/:id
DELETE /api/resources/:id
POST   /api/resource-requests
GET    /api/resource-requests
PUT    /api/resource-requests/:id
```

**Volunteers**
```
POST   /api/volunteers/register
GET    /api/volunteers/opportunities
POST   /api/volunteers/opportunities
PUT    /api/volunteers/assignments/:id
GET    /api/volunteers/my-assignments
```

**Notifications**
```
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/mark-all-read
DELETE /api/notifications/:id
```

#### WebSocket Events

**Location Updates**
```javascript
// Client → Server
socket.emit('location:update', { lat, lng, locationType })
socket.emit('location:subscribe', { bounds })

// Server → Client
socket.on('location:new', (location) => {})
socket.on('location:updated', (location) => {})
socket.on('location:removed', (locationId) => {})
```

**Notifications**
```javascript
// Server → Client
socket.on('notification:new', (notification) => {})
socket.on('notification:update', (notification) => {})
```

**Chat**
```javascript
// Client → Server
socket.emit('chat:join', { roomId })
socket.emit('chat:message', { roomId, message })
socket.emit('chat:typing', { roomId })

// Server → Client
socket.on('chat:message', (message) => {})
socket.on('chat:typing', ({ userId, isTyping }) => {})
```

## Frontend Architecture

### Technology Stack
- **Build Tool**: Vite 5+
- **Framework**: React 18+
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6
- **Maps**: Leaflet + React-Leaflet
- **UI Components**: shadcn/ui

### Component Architecture

**Atomic Design Structure**
```
src/components/
├── atoms/              # Basic building blocks
│   ├── Button/
│   ├── Input/
│   ├── Badge/
│   └── Icon/
│
├── molecules/          # Simple combinations
│   ├── FormField/
│   ├── SearchBar/
│   ├── MapMarker/
│   └── NotificationCard/
│
├── organisms/          # Complex components
│   ├── Header/
│   ├── MissingPersonForm/
│   ├── ResourceList/
│   └── MapView/
│
└── templates/          # Page layouts
    ├── MainLayout/
    ├── DashboardLayout/
    └── AuthLayout/
```

### State Management Strategy

**Zustand Stores**
```typescript
// authStore.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// notificationStore.ts
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification) => void;
  markAsRead: (id) => void;
}

// mapStore.ts
interface MapState {
  center: [number, number];
  zoom: number;
  markers: Marker[];
  filters: MarkerFilters;
  setCenter: (coords) => void;
  addMarker: (marker) => void;
  updateFilters: (filters) => void;
}
```

### Performance Optimizations

1. **Code Splitting**
   - Route-based splitting with React.lazy()
   - Dynamic imports for heavy components (map, chart libraries)

2. **Image Optimization**
   - WebP format with JPEG fallback
   - Lazy loading with Intersection Observer
   - Responsive images with srcset

3. **Caching Strategy**
   - React Query for server state caching (staleTime: 5 minutes)
   - Service Worker for offline assets
   - LocalStorage for user preferences

4. **Bundle Optimization**
   - Tree-shaking unused code
   - Minification and compression
   - CDN for common libraries

## Security Architecture

### Authentication Flow
```
1. User submits credentials
2. Server validates against database
3. Server generates JWT access token (15 min expiry)
4. Server generates refresh token (7 days expiry)
5. Tokens stored in httpOnly cookies
6. Access token sent in Authorization header
7. Refresh token used to get new access token
8. Automatic token refresh on API calls
```

### Authorization Layers
- **Route-level**: Protected routes check authentication
- **Component-level**: Conditional rendering based on roles
- **API-level**: Middleware validates JWT and checks permissions
- **Database-level**: Row-level security (future enhancement)

### Data Protection
- HTTPS everywhere (TLS 1.3)
- Password hashing with bcrypt (12 rounds)
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (React's built-in escaping + CSP)
- CSRF tokens for state-changing operations
- Rate limiting per IP and per user

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers (can run multiple instances)
- Socket.io with Redis adapter for multi-server WebSocket
- Session storage in Redis (shared across servers)
- Load balancer distributes traffic (round-robin or least connections)

### Database Scaling
- Read replicas for read-heavy operations
- Connection pooling (max 20 connections per instance)
- Database indexing on frequently queried columns
- Partitioning for large tables (e.g., notifications by month)

### Caching Strategy
- **Redis Cache Layers**:
  - L1: Frequently accessed data (5 min TTL)
  - L2: API responses (15 min TTL)
  - L3: Session data (no expiry, evict on logout)

### CDN Strategy
- Static assets (JS, CSS, images) served from CDN
- Map tiles cached at edge locations
- API responses NOT cached (real-time data critical)

## Monitoring & Observability

### Logging
- Structured JSON logs (Winston)
- Log levels: ERROR, WARN, INFO, DEBUG
- Correlation IDs for request tracing
- Separate logs for security events

### Metrics
- Application Performance Monitoring (APM)
- Database query performance
- API response times (p50, p95, p99)
- WebSocket connection count
- Cache hit/miss ratios

### Alerts
- Downtime (>1 min)
- Error rate >5%
- API response time >2s (p95)
- Database connection failures
- Disk space <20%
- Memory usage >80%

### Health Checks
```
GET /health      # Basic liveness check
GET /ready       # Readiness check (DB, Redis connected)
GET /metrics     # Prometheus metrics endpoint
```

## Deployment Architecture

### Environments
1. **Development**: Local machines
2. **Staging**: Pre-production testing (Railway/Render)
3. **Production**: Live system (Railway/Render with auto-scaling)

### CI/CD Pipeline
```
Git Push → GitHub Actions
  ├─ Run linters (ESLint, Prettier)
  ├─ Run tests (unit, integration)
  ├─ Build application
  ├─ Run security scan (npm audit)
  ├─ Build Docker image
  └─ Deploy to environment
      ├─ Staging (on merge to develop)
      └─ Production (on release tag)
```

### Backup Strategy
- **Database**: Daily automated backups, 30-day retention
- **User uploads**: Replicated across multiple regions (S3/Cloudinary)
- **Configuration**: Version controlled in Git
- **Recovery Time Objective (RTO)**: <4 hours
- **Recovery Point Objective (RPO)**: <24 hours

## Technology Decisions Rationale

| Decision | Rationale |
|----------|-----------|
| Node.js + Express | Fast development, large ecosystem, excellent for real-time |
| PostgreSQL | ACID compliance, geospatial support (PostGIS), JSON handling |
| Redis | Fast in-memory cache, pub/sub for WebSocket scaling |
| React + Vite | Modern DX, fast builds, excellent ecosystem |
| TypeScript | Type safety reduces bugs, better IDE support |
| Leaflet | Lightweight, free map tiles, offline support |
| JWT | Stateless authentication, mobile-friendly |
| Socket.io | Reliable WebSocket with fallbacks, easy scaling |
| Prisma | Type-safe ORM, excellent migrations, auto-generated types |
| Tailwind CSS | Rapid UI development, small bundle size |

---

**Document Version**: 1.0  
**Last Updated**: November 20, 2025  
**Status**: Draft - Pending Technical Review

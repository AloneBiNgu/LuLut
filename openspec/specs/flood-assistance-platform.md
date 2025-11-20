# Flood Assistance Platform - Project Specification

## Project Overview
A full-stack web application designed to help individuals affected by severe flooding find assistance, share contact information, report locations, and access emergency resources when traditional hotlines (like 112) are overloaded.

---

## 1. Key Features

### 1.1 Contact Information Management
- **Person Registration**
  - Submit missing person reports with photos, last known location, physical description
  - Register as "safe" to notify family/friends
  - Search database by name, location, or physical characteristics
  - Contact verification via phone/email when possible

- **Emergency Contacts**
  - Store personal emergency contact lists
  - Quick-dial emergency services (alternative numbers when 112 is busy)
  - Local rescue team contact directory

### 1.2 Location Tracking & Mapping
- **Interactive Map Interface**
  - Real-time location pins for:
    - Safe zones and evacuation centers
    - Flooded/dangerous areas
    - Resource distribution points
    - Medical facilities still operational
  - User-submitted location updates
  - GPS integration for mobile users
  - Offline map caching for low-connectivity areas

- **Location Reporting**
  - "I'm here and safe" check-ins
  - Request rescue at current location
  - Report hazards or blocked routes
  - Share shelter capacity information

### 1.3 Resource Sharing
- **Resource Exchange**
  - Post available resources (food, water, medicine, shelter space)
  - Request needed supplies
  - Coordinate resource deliveries
  - Track resource distribution to prevent duplicates

- **Volunteer Coordination**
  - Register as volunteer (skills, availability, location)
  - Post volunteer needs/opportunities
  - Match volunteers with requests
  - Track volunteer hours and assignments

### 1.4 Emergency Communication
- **Multi-Channel Alerts**
  - SMS notifications for critical updates
  - Web push notifications
  - Email alerts
  - Emergency broadcast messages from authorities

- **Alternative Hotlines**
  - Display less-congested emergency numbers
  - Call queue status indicators
  - Chat-based support when phone lines are down
  - Connect to local volunteer coordinators

### 1.5 Information Hub
- **Real-time Updates**
  - Weather alerts and forecasts
  - Water level monitoring
  - Road closures and safe routes
  - Official government announcements

- **Safety Resources**
  - Flood survival guides
  - First aid instructions
  - Water purification methods
  - Disease prevention tips

---

## 2. Website Categories & Sections

### 2.1 Immediate Assistance (Priority 1)
- **I Need Help Now**
  - Emergency rescue request form
  - Medical emergency reporting
  - Stranded location reporting
  - Critical resource requests (food, water, medicine)

- **Find Someone**
  - Search missing persons database
  - Report missing person
  - Mark yourself as safe
  - Reunification assistance

### 2.2 Resource Center
- **Available Resources**
  - Food distribution centers
  - Water supply locations
  - Temporary shelters
  - Medical facilities
  - Charging stations for devices

- **Request Resources**
  - Submit resource needs
  - Track request status
  - Resource delivery coordination

### 2.3 Volunteer Opportunities
- **Volunteer Registration**
  - Skills assessment form
  - Availability calendar
  - Location preferences
  - Background verification

- **Active Opportunities**
  - Rescue operations
  - Resource distribution
  - Medical assistance
  - Translation services
  - Technical support

### 2.4 Safety & Information
- **Safety Tips**
  - Before, during, and after flood guidelines
  - Evacuation procedures
  - Water safety
  - Electrical hazards
  - Health and hygiene in flood conditions

- **Local Resources & Services**
  - Government assistance programs
  - Insurance claim guidance
  - Legal aid services
  - Mental health support
  - Pet rescue services

### 2.5 Live Situation Dashboard
- **Current Status**
  - Active alerts map
  - Rescue operations in progress
  - Resource availability heatmap
  - Volunteer activity statistics
  - Success stories (people found, rescued)

### 2.6 Community Updates
- **User Reports**
  - Crowdsourced situation updates
  - Photo/video documentation
  - Route conditions
  - Local area status

---

## 3. Technology Stack

### 3.1 Backend (Node.js + Express)

#### Core Framework
- **Express.js** (v4.18+) - Web application framework
- **Node.js** (v18+ LTS) - Runtime environment

#### Database
- **PostgreSQL** - Primary database for structured data (user profiles, locations, resources)
  - Use `pg` or `node-postgres` driver
  - Consider `Prisma` or `TypeORM` as ORM for easier database management
- **Redis** - Caching and real-time features
  - Session storage
  - Real-time location updates
  - Rate limiting

#### Authentication & Security
- **Passport.js** - Authentication middleware
  - Local strategy (email/password)
  - Social logins (Google, Facebook) for faster registration
- **bcrypt** - Password hashing
- **jsonwebtoken (JWT)** - Token-based authentication
- **helmet** - Security headers
- **express-rate-limit** - Prevent abuse
- **express-validator** - Input validation

#### Real-time Communication
- **Socket.io** - WebSocket connections for:
  - Live map updates
  - Chat support
  - Real-time notifications
  - Volunteer coordination

#### File Handling
- **multer** - File upload handling (photos, documents)
- **sharp** - Image processing and optimization
- **cloudinary** or **AWS S3** - Cloud storage for images

#### Mapping & Location
- **node-geocoder** - Address to coordinates conversion
- **geolib** - Distance calculations and geospatial operations

#### Notifications
- **nodemailer** - Email notifications
- **twilio** - SMS notifications
- **web-push** - Browser push notifications

#### API & Data
- **axios** - HTTP client for external APIs (weather, government data)
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

#### Logging & Monitoring
- **winston** - Logging framework
- **morgan** - HTTP request logging

### 3.2 Frontend (Vite + React)

#### Core Framework
- **Vite** (v5+) - Build tool and dev server
- **React** (v18+) - UI library
- **React Router** (v6+) - Client-side routing

#### State Management
- **Zustand** or **Redux Toolkit** - Global state management
- **React Query (TanStack Query)** - Server state management, caching, and data fetching

#### UI Framework & Components
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** or **Material-UI (MUI)** - Pre-built component library
- **Headless UI** - Unstyled, accessible components

#### Mapping
- **Leaflet** + **React-Leaflet** - Interactive maps
  - Lightweight and works offline
  - Free OpenStreetMap tiles
- **Mapbox GL JS** (alternative) - Advanced mapping features

#### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** or **Yup** - Schema validation

#### Real-time Features
- **Socket.io-client** - WebSocket client

#### Utilities
- **date-fns** or **day.js** - Date manipulation
- **clsx** or **classnames** - Conditional CSS classes
- **axios** - HTTP client

#### PWA & Offline Support
- **Workbox** (via Vite PWA plugin) - Service worker for offline functionality
- **vite-plugin-pwa** - PWA configuration

#### Notifications
- **react-toastify** - Toast notifications
- **react-hot-toast** - Alternative toast library

#### Accessibility
- **react-aria** - Accessible UI primitives
- **@axe-core/react** - Accessibility testing

### 3.3 DevOps & Deployment

#### Development Tools
- **TypeScript** - Type safety for both frontend and backend
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Run linters on staged files

#### Testing
- **Jest** - Unit testing
- **Supertest** - API testing
- **Vitest** - Frontend unit testing (Vite-native)
- **React Testing Library** - Component testing
- **Playwright** or **Cypress** - E2E testing

#### Deployment
- **Docker** - Containerization
- **PM2** - Process management for Node.js
- **Nginx** - Reverse proxy
- **GitHub Actions** or **GitLab CI** - CI/CD pipelines

#### Hosting Options
- **Backend**: Railway, Render, DigitalOcean, AWS EC2
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: Railway, Supabase, Neon, AWS RDS

### 3.4 Recommended Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\..*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Flood Assistance Platform',
        short_name: 'FloodHelp',
        description: 'Emergency assistance for flood victims',
        theme_color: '#1e40af',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

---

## 4. Coding Conventions & Best Practices

### 4.1 Naming Conventions

#### General Rules
- Use **English** for all code, comments, and documentation
- Be descriptive and avoid abbreviations unless widely understood
- Use consistent naming across the project

#### JavaScript/TypeScript
- **Variables & Functions**: `camelCase`
  ```javascript
  const userName = 'John';
  function calculateDistance() {}
  ```

- **Classes & Components**: `PascalCase`
  ```javascript
  class UserService {}
  function UserProfile() {}
  ```

- **Constants**: `UPPER_SNAKE_CASE`
  ```javascript
  const MAX_UPLOAD_SIZE = 5242880; // 5MB
  const API_BASE_URL = process.env.VITE_API_URL;
  ```

- **Private Variables**: Prefix with underscore `_privateVar` (or use # for true private fields)
  ```javascript
  class Database {
    #connection; // Private field
  }
  ```

- **Boolean Variables**: Prefix with `is`, `has`, `should`, `can`
  ```javascript
  const isActive = true;
  const hasPermission = false;
  const shouldRedirect = true;
  ```

#### Files & Folders
- **Components**: `PascalCase.jsx` or `PascalCase.tsx`
  - `UserCard.jsx`, `LocationMap.tsx`
  
- **Utilities/Services**: `camelCase.js` or `camelCase.ts`
  - `authService.js`, `locationUtils.ts`
  
- **Folders**: `kebab-case`
  - `user-profile/`, `resource-sharing/`, `emergency-contacts/`

#### Database
- **Tables**: `snake_case`, plural
  - `users`, `missing_persons`, `resource_requests`
  
- **Columns**: `snake_case`
  - `first_name`, `created_at`, `is_verified`

#### API Routes
- **RESTful conventions**: `kebab-case`, plural nouns
  ```
  GET    /api/users
  POST   /api/users
  GET    /api/users/:id
  PUT    /api/users/:id
  DELETE /api/users/:id
  
  GET    /api/missing-persons
  POST   /api/resource-requests
  GET    /api/evacuation-centers
  ```

### 4.2 File Structure Organization

#### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection
│   │   ├── redis.js             # Redis configuration
│   │   └── cloudinary.js        # File storage config
│   │
│   ├── controllers/             # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── locationController.js
│   │   └── resourceController.js
│   │
│   ├── models/                  # Database models
│   │   ├── User.js
│   │   ├── Location.js
│   │   ├── MissingPerson.js
│   │   └── Resource.js
│   │
│   ├── routes/                  # API routes
│   │   ├── index.js             # Main router
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── locationRoutes.js
│   │   └── resourceRoutes.js
│   │
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js              # Authentication
│   │   ├── validation.js        # Input validation
│   │   ├── errorHandler.js      # Error handling
│   │   └── uploadMiddleware.js  # File uploads
│   │
│   ├── services/                # Business logic
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   └── geocodingService.js
│   │
│   ├── utils/                   # Utility functions
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── helpers.js
│   │
│   ├── sockets/                 # WebSocket handlers
│   │   ├── index.js
│   │   ├── locationSocket.js
│   │   └── chatSocket.js
│   │
│   └── app.js                   # Express app setup
│
├── tests/                       # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── server.js                    # Entry point
```

#### Frontend Structure
```
frontend/
├── public/
│   ├── icons/
│   ├── images/
│   └── manifest.json
│
├── src/
│   ├── assets/                  # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │
│   ├── components/              # Reusable components
│   │   ├── common/              # Generic components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   │
│   │   ├── forms/               # Form components
│   │   │   ├── InputField.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── FormWrapper.jsx
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Navigation.jsx
│   │   │
│   │   └── map/                 # Map components
│   │       ├── LocationMap.jsx
│   │       ├── MapMarker.jsx
│   │       └── MapControls.jsx
│   │
│   ├── pages/                   # Page components
│   │   ├── Home.jsx
│   │   ├── EmergencyRequest.jsx
│   │   ├── MissingPersons.jsx
│   │   ├── ResourceCenter.jsx
│   │   ├── VolunteerHub.jsx
│   │   └── Dashboard.jsx
│   │
│   ├── features/                # Feature-based modules
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── useAuth.js
│   │   │
│   │   ├── resources/
│   │   │   ├── ResourceList.jsx
│   │   │   ├── ResourceRequest.jsx
│   │   │   └── useResources.js
│   │   │
│   │   └── location/
│   │       ├── LocationTracker.jsx
│   │       └── useLocation.js
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useApi.js
│   │   ├── useWebSocket.js
│   │   ├── useGeolocation.js
│   │   └── useLocalStorage.js
│   │
│   ├── services/                # API services
│   │   ├── api.js               # Axios instance
│   │   ├── authApi.js
│   │   ├── locationApi.js
│   │   └── resourceApi.js
│   │
│   ├── store/                   # State management
│   │   ├── userStore.js
│   │   ├── locationStore.js
│   │   └── notificationStore.js
│   │
│   ├── utils/                   # Utility functions
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   └── validators.js
│   │
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Entry point
│   └── routes.jsx               # Route definitions
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### 4.3 Code Style Guidelines

#### General Principles
- **DRY (Don't Repeat Yourself)**: Avoid code duplication
- **KISS (Keep It Simple, Stupid)**: Simple solutions over complex ones
- **YAGNI (You Aren't Gonna Need It)**: Don't add functionality until needed
- **Single Responsibility**: Each function/module should do one thing well

#### Formatting
- **Indentation**: 2 spaces (configure in .editorconfig)
- **Line Length**: Maximum 80-100 characters
- **Semicolons**: Use them (configure ESLint)
- **Quotes**: Single quotes for strings (except JSX attributes)
- **Trailing Commas**: Use in multi-line objects/arrays

#### Example .prettierrc
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "avoid"
}
```

#### React Best Practices
```javascript
// ✅ GOOD: Destructure props
function UserCard({ name, location, status }) {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{location}</p>
      <span>{status}</span>
    </div>
  );
}

// ❌ BAD: Using props object
function UserCard(props) {
  return <div>{props.name}</div>;
}

// ✅ GOOD: Use custom hooks for logic
function UserProfile() {
  const { user, loading, error } = useUser();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{user.name}</div>;
}

// ✅ GOOD: Early returns
function ResourceCard({ resource }) {
  if (!resource) return null;
  if (resource.expired) return <ExpiredNotice />;
  
  return <div>{resource.name}</div>;
}
```

#### Express Best Practices
```javascript
// ✅ GOOD: Async/await with error handling
const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error); // Pass to error handler
  }
};

// ✅ GOOD: Input validation
const createUser = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }
    
    const user = await User.create(value);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ✅ GOOD: Separate routes, controllers, services
// routes/userRoutes.js
router.get('/users', userController.getUsers);
router.post('/users', validate(userSchema), userController.createUser);

// controllers/userController.js
const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// services/userService.js
const getAllUsers = async () => {
  return await User.findAll({ where: { isActive: true } });
};
```

### 4.4 Documentation Standards

#### Code Comments
```javascript
// ✅ GOOD: Explain WHY, not WHAT
// Calculate distance using Haversine formula because simple 
// Euclidean distance doesn't work well for geographic coordinates
const distance = calculateHaversineDistance(point1, point2);

// ❌ BAD: Obvious comment
// Create a new user
const user = new User();
```

#### Function Documentation (JSDoc)
```javascript
/**
 * Calculate the distance between two geographic coordinates
 * 
 * @param {Object} point1 - First coordinate
 * @param {number} point1.lat - Latitude
 * @param {number} point1.lng - Longitude
 * @param {Object} point2 - Second coordinate
 * @param {number} point2.lat - Latitude
 * @param {number} point2.lng - Longitude
 * @returns {number} Distance in kilometers
 * 
 * @example
 * const distance = calculateDistance(
 *   { lat: 13.7563, lng: 100.5018 },
 *   { lat: 13.7650, lng: 100.5380 }
 * );
 */
function calculateDistance(point1, point2) {
  // Implementation
}
```

#### API Documentation
```javascript
/**
 * @route   POST /api/missing-persons
 * @desc    Report a missing person
 * @access  Public
 * @body    {name, age, lastKnownLocation, photo, description}
 * @returns {201} Successfully created report
 * @returns {400} Validation error
 * @returns {500} Server error
 */
router.post('/missing-persons', validate(missingPersonSchema), createReport);
```

#### README.md Structure
```markdown
# Project Name

Brief description of the project

## Features
- Feature 1
- Feature 2

## Tech Stack
- Backend: Node.js, Express, PostgreSQL
- Frontend: React, Vite, Tailwind

## Installation

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Redis (optional)

### Setup
1. Clone repository
2. Install dependencies
3. Configure environment variables
4. Run migrations
5. Start development server

## Environment Variables
See `.env.example` for required variables

## API Documentation
Link to API docs or inline examples

## Contributing
Guidelines for contributors

## License
```

### 4.5 Error Handling

#### Backend
```javascript
// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production: don't leak error details
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }
};
```

#### Frontend
```javascript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// API error handling
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 4.6 Security Best Practices

- **Never commit sensitive data** (.env in .gitignore)
- **Validate all inputs** on both client and server
- **Sanitize user inputs** to prevent XSS
- **Use parameterized queries** to prevent SQL injection
- **Implement rate limiting** to prevent abuse
- **Use HTTPS** in production
- **Set security headers** (use helmet.js)
- **Implement CORS** properly
- **Hash passwords** with bcrypt (salt rounds: 10-12)
- **Use JWT with expiration** (access token: 15min, refresh: 7 days)
- **Validate file uploads** (type, size, scan for malware if possible)

### 4.7 Testing Standards

```javascript
// Unit test example (Jest)
describe('calculateDistance', () => {
  it('should calculate correct distance between two points', () => {
    const point1 = { lat: 13.7563, lng: 100.5018 };
    const point2 = { lat: 13.7650, lng: 100.5380 };
    
    const distance = calculateDistance(point1, point2);
    
    expect(distance).toBeCloseTo(3.2, 1);
  });

  it('should return 0 for same coordinates', () => {
    const point = { lat: 13.7563, lng: 100.5018 };
    
    const distance = calculateDistance(point, point);
    
    expect(distance).toBe(0);
  });
});

// API test example (Supertest)
describe('POST /api/users', () => {
  it('should create a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.email).toBe(userData.email);
  });
});
```

### 4.8 Git Workflow

#### Commit Messages
Follow conventional commits format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add social login with Google

Implemented OAuth2 flow for Google authentication
to provide faster registration during emergencies

Closes #123

---

fix(map): resolve marker clustering issue

Fixed bug where markers weren't clustering properly
on zoom levels 10-12

---

docs(api): update missing persons endpoint documentation
```

#### Branch Naming
```
feature/user-authentication
fix/map-rendering-bug
hotfix/critical-security-patch
refactor/database-queries
```

---

## 5. Implementation Priorities

### Phase 1: MVP (Weeks 1-3)
1. Basic user registration and authentication
2. Simple location map with markers
3. Missing person report submission and search
4. Resource request form
5. Emergency contact directory

### Phase 2: Core Features (Weeks 4-6)
1. Real-time map updates with Socket.io
2. Volunteer registration and matching
3. SMS/Email notifications
4. Advanced search and filters
5. Mobile responsiveness and PWA setup

### Phase 3: Advanced Features (Weeks 7-9)
1. Offline support
2. Chat functionality
3. Admin dashboard
4. Analytics and reporting
5. Multi-language support (Thai/English)

### Phase 4: Optimization (Weeks 10-12)
1. Performance optimization
2. Security hardening
3. Comprehensive testing
4. Documentation
5. Deployment and monitoring

---

## 6. Critical Considerations for Emergency Context

### Performance
- **Target**: Page load < 3 seconds on 3G connection
- Implement aggressive caching
- Optimize images (WebP format, lazy loading)
- Use CDN for static assets
- Database query optimization

### Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode
- Large touch targets for mobile (min 44x44px)

### Offline Capability
- Cache critical pages and resources
- Queue requests when offline
- Sync data when connection restored
- Show clear offline/online status

### Mobile-First
- Design for mobile screens first
- Touch-friendly interface
- Minimize data usage
- GPS integration
- Camera access for photos

### Scalability
- Prepare for traffic spikes during disasters
- Use load balancing
- Database read replicas
- Implement caching layers
- CDN for static content

### Data Privacy
- Minimal data collection
- Clear privacy policy
- Option to submit anonymously
- Data retention policy
- GDPR compliance (if applicable)

---

## Next Steps

1. **Review and approve this specification**
2. **Set up development environment**
   - Install Node.js, PostgreSQL, Redis
   - Create GitHub repository
   - Configure environment variables

3. **Initialize projects**
   - Backend: `npm init` + install dependencies
   - Frontend: `npm create vite@latest`

4. **Database design**
   - Create ER diagram
   - Write migration scripts
   - Set up Prisma/TypeORM

5. **Start with Phase 1 MVP**
   - Build authentication system
   - Create basic map interface
   - Implement core forms

6. **Set up CI/CD pipeline**
   - Automated testing
   - Deployment workflows

7. **Regular testing with real users**
   - Gather feedback
   - Iterate quickly

---

## Resources & References

### Documentation
- [Node.js Docs](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/guide)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide)
- [Leaflet Docs](https://leafletjs.com/reference.html)

### Tutorials
- [REST API with Node.js and Express](https://www.youtube.com/watch?v=fgTGADljAeg)
- [React + Vite Tutorial](https://www.youtube.com/watch?v=bMknfKXIFA8)
- [Socket.io Real-time Apps](https://socket.io/get-started/chat)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [DBeaver](https://dbeaver.io/) - Database management
- [Figma](https://www.figma.com/) - UI design
- [Excalidraw](https://excalidraw.com/) - Diagrams

---

**Last Updated**: November 20, 2025  
**Status**: Draft - Awaiting Review  
**Version**: 1.0

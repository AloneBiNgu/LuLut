# User Authentication Specification

## ADDED Requirements

### Requirement: User Registration
The system SHALL provide multiple registration methods to enable rapid onboarding during emergencies.

#### Scenario: Register with email and password
- **GIVEN** a new user wanting to create an account
- **WHEN** they provide email, password, full name, and phone number
- **AND** submit the registration form
- **THEN** the system validates email format and password strength (min 8 chars, 1 uppercase, 1 number)
- **AND** checks for duplicate email addresses
- **AND** creates a new user account
- **AND** sends verification email with confirmation link
- **AND** allows immediate login with "unverified" status

#### Scenario: Quick registration during emergency
- **GIVEN** a user needing immediate access during a crisis
- **WHEN** they choose "Emergency Quick Registration"
- **THEN** the system requires only email and password (optional phone)
- **AND** skips email verification
- **AND** grants immediate access with limited permissions
- **AND** prompts for profile completion later

#### Scenario: Social login (Google/Facebook)
- **GIVEN** a user preferring social authentication
- **WHEN** they click "Continue with Google"
- **THEN** the system redirects to Google OAuth consent screen
- **AND** receives user profile data upon approval
- **AND** creates account using Google email
- **AND** auto-verifies the email address
- **AND** redirects to dashboard

#### Scenario: Registration validation errors
- **GIVEN** a user submitting registration form
- **WHEN** they enter an already-registered email
- **THEN** the system displays "Email already registered" error
- **AND** suggests password reset option
- **AND** prevents account creation

### Requirement: User Login
The system SHALL provide secure login with session management and remember-me functionality.

#### Scenario: Successful login
- **GIVEN** a registered user with verified email
- **WHEN** they enter correct email and password
- **THEN** the system validates credentials
- **AND** generates JWT access token (15-minute expiry)
- **AND** generates refresh token (7-day expiry)
- **AND** stores tokens in httpOnly cookies
- **AND** redirects to dashboard or intended page

#### Scenario: Failed login - invalid credentials
- **GIVEN** a user attempting to login
- **WHEN** they enter incorrect password
- **THEN** the system displays "Invalid email or password" (generic for security)
- **AND** increments failed login counter
- **AND** does not reveal whether email exists
- **AND** allows retry

#### Scenario: Account lockout after multiple failures
- **GIVEN** a user with 5 failed login attempts
- **WHEN** they attempt a 6th login
- **THEN** the system locks the account for 15 minutes
- **AND** displays "Too many failed attempts. Try again in 15 minutes."
- **AND** sends security alert email to user
- **AND** logs the lockout event

#### Scenario: Remember me functionality
- **GIVEN** a user logging in with "Remember Me" checked
- **WHEN** login succeeds
- **THEN** the system extends refresh token expiry to 30 days
- **AND** keeps user logged in across browser sessions
- **AND** validates tokens on each request

### Requirement: Password Management
The system SHALL provide secure password reset and change functionality.

#### Scenario: Request password reset
- **GIVEN** a user who forgot their password
- **WHEN** they enter their registered email on password reset page
- **THEN** the system generates a unique reset token (valid 1 hour)
- **AND** sends password reset email with link
- **AND** displays "If email exists, reset link sent" (prevents email enumeration)
- **AND** does not reveal whether email is registered

#### Scenario: Reset password with token
- **GIVEN** a user clicking the password reset link
- **WHEN** they enter new password (meeting strength requirements) and confirm
- **THEN** the system validates the reset token
- **AND** checks token expiry (must be < 1 hour old)
- **AND** hashes and updates the password
- **AND** invalidates all existing sessions
- **AND** sends confirmation email
- **AND** redirects to login page

#### Scenario: Expired reset token
- **GIVEN** a password reset token older than 1 hour
- **WHEN** user attempts to use it
- **THEN** the system displays "Reset link expired. Request a new one."
- **AND** provides link to password reset page
- **AND** does not allow password change

#### Scenario: Change password while logged in
- **GIVEN** an authenticated user wanting to change password
- **WHEN** they provide current password and new password
- **THEN** the system validates current password
- **AND** verifies new password meets strength requirements
- **AND** updates password hash
- **AND** invalidates all sessions except current one
- **AND** sends confirmation email

### Requirement: Session Management
The system SHALL manage user sessions securely with automatic expiration and renewal.

#### Scenario: Automatic token refresh
- **GIVEN** a user with valid refresh token and expired access token
- **WHEN** they make an API request
- **THEN** the system detects expired access token
- **AND** validates refresh token
- **AND** generates new access token
- **AND** returns new token in response
- **AND** continues processing the request

#### Scenario: Session expiry
- **GIVEN** a user with expired refresh token
- **WHEN** they attempt to access protected resource
- **THEN** the system returns 401 Unauthorized
- **AND** clears client-side tokens
- **AND** redirects to login page
- **AND** preserves intended destination for post-login redirect

#### Scenario: Logout
- **GIVEN** an authenticated user
- **WHEN** they click logout
- **THEN** the system invalidates current refresh token
- **AND** clears all cookies
- **AND** redirects to login or home page
- **AND** displays logout confirmation

#### Scenario: Logout from all devices
- **GIVEN** a user wanting to terminate all active sessions
- **WHEN** they select "Logout from all devices"
- **THEN** the system invalidates all refresh tokens for that user
- **AND** forces re-authentication on all devices
- **AND** sends security notification email
- **AND** logs the action

### Requirement: Email Verification
The system SHALL verify user email addresses to ensure contact information accuracy.

#### Scenario: Send verification email
- **GIVEN** a newly registered user
- **WHEN** registration completes
- **THEN** the system generates unique verification token (24-hour validity)
- **AND** sends email with verification link
- **AND** allows user to login with unverified status
- **AND** restricts certain features until verified

#### Scenario: Verify email successfully
- **GIVEN** a user clicking the verification link
- **WHEN** the token is valid and not expired
- **THEN** the system marks email as verified
- **AND** updates user account status
- **AND** unlocks full platform features
- **AND** displays success message
- **AND** redirects to dashboard

#### Scenario: Resend verification email
- **GIVEN** an unverified user who didn't receive the email
- **WHEN** they request to resend verification
- **THEN** the system generates new verification token
- **AND** invalidates previous token
- **AND** sends new verification email
- **AND** rate-limits to 3 resends per hour

### Requirement: User Profile Management
The system SHALL allow users to view and update their profile information.

#### Scenario: View profile
- **GIVEN** an authenticated user
- **WHEN** they navigate to profile page
- **THEN** the system displays:
  - Name, email, phone
  - Profile photo
  - Account creation date
  - Verification status
  - Activity summary (reports submitted, resources posted)

#### Scenario: Update profile information
- **GIVEN** a user wanting to update their name
- **WHEN** they edit the name field and save
- **THEN** the system validates the input
- **AND** updates the user record
- **AND** displays success confirmation
- **AND** reflects change immediately across the platform

#### Scenario: Update email address
- **GIVEN** a user changing their email
- **WHEN** they provide new email and current password
- **THEN** the system validates password
- **AND** checks new email isn't already registered
- **AND** sends verification email to new address
- **AND** marks email as unverified until confirmed
- **AND** keeps old email active for 24 hours

#### Scenario: Upload profile photo
- **GIVEN** a user uploading a profile picture
- **WHEN** they select an image file (<5MB, JPEG/PNG)
- **THEN** the system validates file size and format
- **AND** crops/resizes to square thumbnail (200x200px)
- **AND** uploads to cloud storage
- **AND** updates user profile with photo URL
- **AND** displays new photo immediately

### Requirement: Role-Based Access Control
The system SHALL enforce role-based permissions for different user types.

#### Scenario: Default user permissions
- **GIVEN** a newly registered regular user
- **WHEN** they access the platform
- **THEN** they can:
  - Submit missing person reports
  - Post/request resources
  - View maps and locations
  - Volunteer for opportunities
- **AND** they cannot:
  - Access admin dashboard
  - Moderate content
  - Verify organizations

#### Scenario: Volunteer coordinator permissions
- **GIVEN** a user with "Coordinator" role
- **WHEN** they access the platform
- **THEN** they inherit all regular user permissions
- **AND** additionally can:
  - Assign volunteers to opportunities
  - View volunteer statistics
  - Create distribution events
  - Approve resource requests

#### Scenario: Administrator permissions
- **GIVEN** a user with "Admin" role
- **WHEN** they access the platform
- **THEN** they can:
  - Access admin dashboard
  - Moderate all content
  - Manage user accounts
  - View analytics and reports
  - Grant/revoke roles
  - Configure system settings

### Requirement: Account Security
The system SHALL implement security measures to protect user accounts.

#### Scenario: Detect suspicious login
- **GIVEN** a user logging in from new device/location
- **WHEN** the system detects unusual login pattern
- **THEN** it sends security alert email with login details (device, location, time)
- **AND** prompts user to confirm "Was this you?"
- **AND** offers option to secure account if compromised

#### Scenario: Two-factor authentication (optional)
- **GIVEN** a user enabling 2FA
- **WHEN** they enable it in security settings
- **THEN** the system generates QR code for authenticator app
- **AND** prompts for verification code to confirm setup
- **AND** generates backup codes for account recovery
- **AND** requires 2FA code on future logins

---

## Performance Requirements

- Login SHALL complete within 500ms under normal load
- Password hashing SHALL use bcrypt with 10-12 salt rounds
- JWT token validation SHALL complete within 50ms
- Email delivery SHALL be queued and sent within 30 seconds
- Session validation SHALL complete within 100ms per request

## Security Requirements

- Passwords SHALL be hashed using bcrypt (never stored in plain text)
- JWT secrets SHALL be stored in environment variables only
- Tokens SHALL be transmitted only over HTTPS
- Session cookies SHALL have httpOnly and secure flags
- Rate limiting SHALL apply: 5 login attempts per 15 minutes per IP
- Password reset tokens SHALL be single-use only
- CSRF protection SHALL be implemented for state-changing requests

## Accessibility Requirements

- Login/registration forms SHALL be keyboard navigable
- Error messages SHALL be announced to screen readers
- Password strength indicators SHALL have text alternatives
- CAPTCHA (if used) SHALL have audio alternative
- Social login buttons SHALL have descriptive labels

## Data Requirements

- User emails SHALL be stored in lowercase
- Phone numbers SHALL support international formats
- User IDs SHALL be UUID v4
- Account data SHALL be retained for 2 years after last login
- Deleted accounts SHALL be soft-deleted (anonymized) for audit trail

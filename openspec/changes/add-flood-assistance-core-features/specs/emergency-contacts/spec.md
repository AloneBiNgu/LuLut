# Emergency Contacts Specification

## ADDED Requirements

### Requirement: User Safety Check-in
The system SHALL allow users to mark themselves as safe during a flood emergency, notifying their registered emergency contacts automatically.

#### Scenario: User marks themselves safe
- **GIVEN** a registered user affected by flooding
- **WHEN** they access the safety check-in feature and confirm their safe status
- **THEN** the system records their status with timestamp and location
- **AND** sends notifications to all their registered emergency contacts
- **AND** updates their status on the public dashboard
- **AND** includes their current location if GPS is enabled

#### Scenario: Emergency contact receives notification
- **GIVEN** a user has been marked as an emergency contact
- **WHEN** their associated user marks themselves safe
- **THEN** they receive a notification via email and/or SMS
- **AND** the notification includes the user's name, timestamp, and location
- **AND** they can view the full safety check-in details

### Requirement: Missing Person Report Submission
The system SHALL enable users to submit detailed missing person reports with photos, descriptions, and last known locations.

#### Scenario: Submit complete missing person report
- **GIVEN** a user with information about a missing person
- **WHEN** they fill out the missing person form with name, age, photo, physical description, and last known location
- **AND** submit the report
- **THEN** the system validates all required fields
- **AND** stores the report in the database
- **AND** displays the report in public search results
- **AND** sends confirmation to the submitter
- **AND** assigns a unique tracking ID

#### Scenario: Submit report without photo
- **GIVEN** a user reporting a missing person without a photo
- **WHEN** they submit the form with only text description
- **THEN** the system accepts the report
- **AND** marks it as "no photo available"
- **AND** allows photo upload later

#### Scenario: Invalid report submission
- **GIVEN** a user attempting to submit a missing person report
- **WHEN** they omit required fields (name or last known location)
- **THEN** the system displays validation errors
- **AND** highlights the incomplete fields
- **AND** prevents submission until corrected

### Requirement: Missing Person Search
The system SHALL provide comprehensive search functionality to find missing person reports using multiple criteria.

#### Scenario: Search by name
- **GIVEN** multiple missing person reports in the database
- **WHEN** a user searches by name "John"
- **THEN** the system returns all reports containing "John" in the name field
- **AND** displays results sorted by most recent first
- **AND** shows preview cards with photo, name, age, and last seen date

#### Scenario: Search by location radius
- **GIVEN** missing person reports across different locations
- **WHEN** a user searches within 10km of a specific coordinate
- **THEN** the system returns all reports where last known location is within that radius
- **AND** displays distance from search center
- **AND** sorts results by proximity

#### Scenario: Advanced multi-criteria search
- **GIVEN** a user looking for a specific missing person
- **WHEN** they apply filters for age range (20-30), male gender, and location within 5km
- **THEN** the system returns only reports matching all criteria
- **AND** displays the number of results found
- **AND** allows further refinement

#### Scenario: No results found
- **GIVEN** a search query with no matching reports
- **WHEN** the user submits the search
- **THEN** the system displays "No results found" message
- **AND** suggests broadening search criteria
- **AND** offers to save the search for future notifications

### Requirement: Emergency Contact Directory
The system SHALL maintain a directory of emergency services with real-time availability status and contact information.

#### Scenario: View emergency contacts by category
- **GIVEN** a user needing emergency assistance
- **WHEN** they navigate to the emergency contacts directory
- **THEN** the system displays contacts organized by categories (Medical, Rescue, Government, Utilities)
- **AND** shows contact name, phone number, and current availability status
- **AND** provides click-to-call functionality on mobile devices

#### Scenario: Alternative hotline when 112 is busy
- **GIVEN** the national emergency hotline 112 is experiencing high call volumes
- **WHEN** a user views the emergency contacts
- **THEN** the system prominently displays alternative emergency numbers
- **AND** shows estimated wait times if available
- **AND** highlights less congested options

#### Scenario: Share emergency contact
- **GIVEN** a user viewing an emergency contact
- **WHEN** they click the share button
- **THEN** the system provides options to share via SMS, email, or social media
- **AND** includes contact name, number, and website link

### Requirement: Contact Verification
The system SHALL verify submitted contact information to ensure accuracy and prevent spam or fraudulent reports.

#### Scenario: Email verification for new reports
- **GIVEN** a user submitting their first missing person report
- **WHEN** they provide an email address
- **THEN** the system sends a verification link to that email
- **AND** marks the report as "pending verification"
- **AND** makes the report publicly visible only after verification
- **AND** allows 24 hours for verification before archiving unverified reports

#### Scenario: Phone verification (optional)
- **GIVEN** a user choosing to verify via phone
- **WHEN** they enter their phone number
- **THEN** the system sends a 6-digit verification code via SMS
- **AND** prompts them to enter the code
- **AND** activates their report upon successful verification

#### Scenario: Skip verification for urgent cases
- **GIVEN** a user submitting an emergency report
- **WHEN** they select "urgent/emergency" priority
- **THEN** the system publishes the report immediately without verification
- **AND** flags it for later verification
- **AND** displays a "unverified" badge until confirmed

### Requirement: Report Status Management
The system SHALL allow report submitters and authorized users to update the status of missing person reports.

#### Scenario: Mark person as found
- **GIVEN** a missing person report that is active
- **WHEN** the submitter or family member marks the person as found
- **THEN** the system updates the report status to "Found"
- **AND** records the date/time found
- **AND** removes the report from active search results
- **AND** archives it in the resolved cases
- **AND** sends notification to all users who saved or shared that report

#### Scenario: Update last known location
- **GIVEN** new information about a missing person's location
- **WHEN** the submitter updates the last known location field
- **THEN** the system saves the update with timestamp
- **AND** displays the update history on the report
- **AND** sends notifications to users watching that report
- **AND** updates the location marker on the map

### Requirement: Privacy Protection
The system SHALL protect sensitive personal information while allowing effective search and coordination.

#### Scenario: Anonymous reporting option
- **GIVEN** a user who wishes to remain anonymous
- **WHEN** they choose the anonymous reporting option
- **THEN** the system accepts the report without requiring personal contact information
- **AND** provides a unique access code for future updates
- **AND** marks the report as "submitted anonymously"

#### Scenario: Controlled information disclosure
- **GIVEN** a missing person report with contact information
- **WHEN** a user views the report
- **THEN** the system displays only partial contact information (e.g., masked email)
- **AND** provides a "Contact Submitter" button that routes messages through the system
- **AND** does not expose full contact details publicly

---

## Performance Requirements

- Search queries SHALL return results within 500ms for databases up to 10,000 records
- Missing person photo uploads SHALL be limited to 5MB and processed within 3 seconds
- The system SHALL support at least 1,000 concurrent search operations
- Report submission SHALL complete within 2 seconds under normal load

## Security Requirements

- All contact information SHALL be encrypted at rest
- Email verification links SHALL expire after 24 hours
- Phone verification codes SHALL expire after 10 minutes
- Users SHALL be rate-limited to 5 report submissions per hour to prevent spam
- Photo uploads SHALL be scanned for inappropriate content

## Accessibility Requirements

- All forms SHALL be navigable via keyboard only
- Form validation errors SHALL be announced to screen readers
- Contact directory SHALL support high-contrast mode
- Touch targets SHALL be minimum 44x44 pixels on mobile devices

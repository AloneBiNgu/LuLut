# Flood Assistance Platform

A full-stack application to assist communities during flood emergencies.

## Project Structure

- **backend/**: Node.js/Express API with Socket.io for real-time updates.
- **frontend/**: React/Vite application with Tailwind CSS and Leaflet maps.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (running locally or via Docker)

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm run install:all
    ```

2.  **Environment Setup**
    *   **Backend**:
        *   Go to `backend/`
        *   Copy `.env.example` to `.env`
        *   Update `DATABASE_URL` with your PostgreSQL credentials.
    *   **Frontend**:
        *   (Optional) Create `.env` in `frontend/` if needed for API URLs.

3.  **Run the Application**
    To run both backend and frontend concurrently:
    ```bash
    npm run start
    ```

    *   Frontend: http://localhost:5173
    *   Backend: http://localhost:5000

## Development

- **Backend**: Runs on port 5000. Uses `ts-node-dev` for hot reloading.
- **Frontend**: Runs on port 5173 (default Vite port).

## Features (Planned)

- Real-time Emergency Alerts
- Interactive Map for Resources & Hazards
- Resource Request/Offer System
- Volunteer Coordination

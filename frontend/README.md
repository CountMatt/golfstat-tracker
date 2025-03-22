# Golf Stats Tracker

A personal application for tracking golf rounds and analyzing performance statistics.

## Features

- Track full rounds of golf, including detailed statistics for each hole
- Record fairway hits, greens in regulation, approach shots, and putting stats
- Local storage with MongoDB synchronization for data backup and advanced analysis
- Statistics dashboard with visualizations of your performance over time
- Responsive design that works on both desktop and mobile devices

## Technical Stack

- **Frontend**: React with Vite, React Router, Recharts for visualizations
- **Backend**: Express.js RESTful API
- **Database**: MongoDB for persistent storage
- **Containerization**: Docker for easy deployment

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js and npm (for development)

### Running with Docker

The easiest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/yourusername/golf-stats-tracker.git
cd golf-stats-tracker

# Start all services with Docker Compose
docker-compose up -d

# The application will be available at http://localhost
```

### Development Setup

For local development:

```bash
# Backend setup
cd server
npm install
npm run dev

# Frontend setup (in a separate terminal)
cd frontend
npm install
npm run dev
```

The development server will be available at http://localhost:5173

## Data Synchronization

Data is stored locally in your browser's localStorage and synchronized with MongoDB when online. This provides:

1. Offline functionality when playing a round without internet
2. Data backup to prevent loss if browser data is cleared
3. Advanced analytics capabilities on the server side

To manually trigger synchronization, use the "Sync Now" button in the data management section.

## Project Structure

```
golf-stats-tracker/
├── docker-compose.yml     # Docker configuration
├── Dockerfile             # Frontend Docker configuration
├── nginx.conf            # Nginx configuration for frontend
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── ...
│   └── ...
├── server/               # Express.js backend
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   └── server.js         # Entry point
└── ...
```

## License

This project is for personal use only.
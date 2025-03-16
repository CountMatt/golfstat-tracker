const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const roundsRoutes = require('./routes/rounds');
const shotsRoutes = require('./routes/shots');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : 'http://localhost:5173',
  credentials: true
}));

// Security headers
app.use(helmet());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/rounds', roundsRoutes);
app.use('/api/shots', shotsRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Golf Tracker API is running');
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;

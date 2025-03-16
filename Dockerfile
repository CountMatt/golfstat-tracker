# Use Node.js as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ ./

# Build the app
RUN npm run build

# Install a simple HTTP server to serve static content
RUN npm install -g serve

# Expose the port
EXPOSE 80

# Start the server
CMD ["serve", "-s", "dist", "-l", "80"]
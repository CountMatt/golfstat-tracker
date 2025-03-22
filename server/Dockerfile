# server/Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port (will be overridden by environment variable if provided)
EXPOSE 5001

# Use a start script that waits for MongoDB to be ready
RUN echo '#!/bin/sh \n\
echo "Waiting for MongoDB to be ready..." \n\
# Wait for MongoDB to be ready (simple retry mechanism) \n\
RETRIES=30 \n\
until nc -z mongodb 27017 || [ $RETRIES -eq 0 ]; do \n\
  echo "Waiting for MongoDB server, $((RETRIES--)) remaining attempts..." \n\
  sleep 1 \n\
done \n\
\n\
if [ $RETRIES -eq 0 ]; then \n\
  echo "MongoDB connection failed after multiple attempts. Starting server anyway..." \n\
fi \n\
\n\
echo "Starting server..." \n\
exec node server.js' > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

# Install netcat for the health check
RUN apk add --no-cache netcat-openbsd

# Set the entrypoint
CMD ["/docker-entrypoint.sh"]
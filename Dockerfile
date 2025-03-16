FROM openjdk:21-jdk-slim

# Install required dependencies
RUN apt-get update && apt-get install -y curl \
    && curl -sL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && curl -L https://www.npmjs.com/install.sh | npm_install="10.2.3" | sh

WORKDIR /usr/src/app

# Copy everything first
COPY . .

# Ensure mvnw is executable before removing frontend
RUN chmod +x mvnw
RUN sed -i 's/\r$//' mvnw

# Build the frontend
RUN cd frontend && npm install
RUN cd frontend && npm run build

# Remove frontend (ONLY if mvnw is not inside it)
RUN rm -r frontend

# Build the Java application
RUN ./mvnw package

# Expose the application port
EXPOSE 8080

# Start the application
CMD ["java", "-jar", "/usr/src/app/target/golf-tracker.jar"]
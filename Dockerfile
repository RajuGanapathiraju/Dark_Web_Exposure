# Use the official Node.js 14 image
FROM node:14

# Install Tor
RUN apt-get update && apt-get install -y tor

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files into the container at /app
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container at /app
COPY . .

# Expose port 8080 to the outside world
EXPOSE 8080

# Run Tor and then the application
CMD service tor start && node index.js


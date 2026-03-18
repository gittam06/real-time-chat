# Use Node.js as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
# Add the --legacy-peer-deps flag here to bypass the Vite version conflict
RUN npm install --legacy-peer-deps

# Copy the rest of the frontend code
COPY . .

# Vite runs on 5173 by default
EXPOSE 5173

# Start Vite with the --host flag so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
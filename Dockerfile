# Use Node 20 as requested
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Build the Next.js application
RUN npm run build

# Default Next.js port
EXPOSE 3000

# Start the application on the port expected by the service
CMD ["npm", "start", "--", "-p", "3000"]

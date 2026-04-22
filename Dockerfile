# Use Node 20 as requested
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Inject environment variables for the build phase
# We copy the 'env.production' (no dot) to '.env.production' (dot)
# so Next.js can read it during 'npm run build'
COPY env.production .env.production

# Build the Next.js application
RUN npm run build

# Default Next.js port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
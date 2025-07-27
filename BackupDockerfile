# Stage 1: Build the application
FROM node:22.14.0-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install all dependencies for building
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Prune dev dependencies for a smaller node_modules
RUN npm prune --production

# Stage 2: Create the final production image
FROM node:22.14.0-alpine

WORKDIR /usr/src/app

# Copy the configuration file for PM2
COPY --from=builder /usr/src/app/ecosystem.config.js ./

# Copy the pruned node_modules and the built application from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

# Command to run the application via PM2
CMD ["npm", "run", "start:prod"]

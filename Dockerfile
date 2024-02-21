# Use the official Node.js 16 image
FROM node:18

# Install firebase-tools globally
RUN npm install -g firebase-tools

# Set the working directory to the functions directory
WORKDIR /usr/src/app/functions

# Copy package.json and package-lock.json
COPY functions/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the functions code
COPY functions/ ./

# Copy firebase.json from the root directory to the current directory
COPY firebase.json /usr/src/app/firebase.json

# Expose the port if necessary (if your functions listen on a specific port)
EXPOSE 8080

# Command to run the functions
CMD ["firebase", "deploy", "--only", "functions", "--project", "smart-agriculture-414515"]

# Use the official Node.js image from the Docker Hub
FROM node:22

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your app runs on
ENV PORT 8080

# Define the command to run the app
CMD ["npm", "start"]

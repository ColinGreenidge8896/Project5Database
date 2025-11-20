FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies - confirm these
COPY package*.json ./
RUN npm install --production

# Copy the rest of the backend code 
COPY . .

# Expose backend port
EXPOSE 3000

# Start the backend
CMD ["node", "src/server.js"]
#replace with CMD ["npm", "run", "dev"] when nodemon configured

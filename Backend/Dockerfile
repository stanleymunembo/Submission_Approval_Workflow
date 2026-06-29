# ============================================================
# BACKEND DOCKERFILE
# ============================================================
# Think of this as a recipe card for your API server.
# Docker reads this file and builds a small box that runs Node.

# STEP 1: Download a pre-made Linux + Node setup
FROM node:20-alpine

# STEP 2: Inside the box, work in folder /app
WORKDIR /app

# STEP 3: Copy package.json first (speed trick for rebuilds)
COPY package*.json ./

# STEP 4: Install packages (production only — no Jest needed here)
RUN npm install --omit=dev

# STEP 5: Copy your Backend source code into the box
COPY . .

# STEP 6: Tell humans this app uses port 4000
EXPOSE 4000

# STEP 7: When box starts, run the same command you use locally
CMD ["npm", "start"]

# /client/Dockerfile

# --- Stage 1: Build the React App ---
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
# 🚨 FIX: Tells NPM to ignore the Apollo/GraphQL version conflicts
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine
# Copy the compiled Vite output to Nginx's public folder
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy our custom routing config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
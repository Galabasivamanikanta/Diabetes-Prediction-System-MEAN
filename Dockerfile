# 1. Build Stage for Angular Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build -- --configuration production

# 2. Final Output Stage
FROM node:20-alpine
WORKDIR /app

# Install Python and dependencies
RUN apk add --no-cache python3 py3-pip py3-numpy py3-pandas py3-scikit-learn || \
    (apk add --no-cache python3 py3-pip && \
     python3 -m venv /opt/venv && \
     /opt/venv/bin/pip install --upgrade pip && \
     /opt/venv/bin/pip install numpy pandas scikit-learn pickle-mixin)

ENV PATH="/opt/venv/bin:$PATH"

# Copy Backend and ML Model
COPY backend ./backend
COPY ml-model ./ml-model

# Install Backend Dependencies
WORKDIR /app/backend
RUN npm install

# IMPORTANT: Find the built Angular files and copy them to a predictable location
# In Angular 17+, the build output is usually frontend/dist/frontend/browser
COPY --from=frontend-build /app/frontend/dist/frontend/browser /app/public

# Final Configuration
WORKDIR /app/backend
EXPOSE 5001
ENV PORT=5001
ENV NODE_ENV=production
# Tell the backend where to find the static files
ENV STATIC_PATH=/app/public

CMD ["node", "server.js"]

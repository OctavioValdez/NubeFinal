# First stage: Node.js build
FROM node:16-bullseye as node_builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Final stage: Python environment
FROM python:3.10-slim
WORKDIR /app
COPY --from=node_builder /app/node_modules ./node_modules
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV FLASK_APP=app.py
EXPOSE 5000
CMD ["python", "__init__.py"]

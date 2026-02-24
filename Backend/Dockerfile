# Use official Python runtime as base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/data

# Create entrypoint script
RUN printf '#!/bin/bash\npython manage.py migrate --noinput\npython manage.py collectstatic --noinput\nexec gunicorn server.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 8000

# Run entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

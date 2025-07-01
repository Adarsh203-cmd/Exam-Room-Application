#!/usr/bin/env bash
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Create staticfiles directory if it doesn't exist
mkdir -p staticfiles

# Run migrations first
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput --clear
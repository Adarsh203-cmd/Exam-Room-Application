#!/usr/bin/env bash
set -o errexit


pip install -r requirements.txt

mkdir -p staticfiles

# Run migrations first
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput --clear

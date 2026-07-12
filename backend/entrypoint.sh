#!/bin/bash
set -e

echo "Starting Django..."

python manage.py migrate --noinput

# Always collectstatic in production containers
python manage.py collectstatic --noinput
exec "$@"

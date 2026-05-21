#!/bin/bash
set -e

echo "Starting Django..."

python manage.py migrate --noinput

if [ "$DJANGO_SETTINGS_MODULE" = "core.settings.production" ]; then
    python manage.py collectstatic --noinput
fi

exec "$@"

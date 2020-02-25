#!/bin/sh
cd ./rebuc-frontend || exit
yarn build
cd ..
python3 manage.py makemigrations
python3 manage.py migrate
echo "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@example.com','pass')" | python3 manage.py shell
python3 manage.py runserver 0.0.0.0:8002

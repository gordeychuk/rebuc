from django.db import IntegrityError
from django.utils.timezone import now
from rebuc_app.models import Build


class UnitTestHelper:
    @staticmethod
    def create_build(name):
        return Build.objects.create(name=name, description='test desc', release_date=now(),
                                    url='http://localhost')

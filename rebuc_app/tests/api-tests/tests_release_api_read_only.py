from .common import ApiTestHelperNoAuth
from django.utils.timezone import now
from rebuc_app.models import *


class ReleasesApiTestReadOnly(ApiTestHelperNoAuth):
    def setUp(self) -> None:
        super(ReleasesApiTestReadOnly, self).setUp()
        self.url = self.base_url + 'releases/'
        self.build_name = self.helper.random_build_name(5)
        self.start_build = Build.objects.create(name=self.build_name, release_date=now(),
                                                url=self.helper.random_str(10))
        self.build_mask = self.create_build_mask_based_on_build(self.build_name)
        self.release_pattern = ReleasePattern.objects.create(start_build=self.start_build, build_mask=self.build_mask)
        self.test_object = Release.objects.create(
            name=self.helper.random_ascii_str(10),
            description=self.helper.random_str(100),
            release_date=self.helper.random_date(),
            release_pattern=self.release_pattern
        )
        self.build_name_to_add = self.helper.random_build_name(5)
        self.build_to_add = Build.objects.create(name=self.build_name_to_add, release_date=now(),
                                                 url=self.helper.random_str(10))
        self.build_mask_data_to_add = self.create_build_mask_data_based_on_build(self.build_to_add.name)
        self.data_to_add = {
            'name': self.helper.random_ascii_str(20),
            'description': self.helper.random_str(100),
            'release_date': self.helper.random_date(),
            'release_pattern': {
                'start_build': {
                    'id': self.build_to_add.id
                },
                'build_mask': self.build_mask_data_to_add
            }
        }

    def test_get_releases(self):
        resp = self.client.get(self.url)
        self.check_code_200(resp)
        self.check_in_response(resp, self.test_object.as_dict())

    def test_get_release(self):
        resp = self.client.get(self.url + '{}/'.format(self.test_object.pk))
        self.check_code_200(resp)
        self.check_equal_response(resp, self.test_object.as_dict())

    def test_create_release(self):
        self.check_post_no_permissions(self.url)

    def test_update_release_name(self):
        self.check_put_no_permissions(self.url + '{}/'.format(self.test_object.pk))

    def test_delete_release(self):
        self.check_delete_no_permissions(self.url + '{}/'.format(self.test_object.id))


from .common import ApiTestHelperNoAuth
from rebuc_app.models import *


class BuildsApiTestReadOnly(ApiTestHelperNoAuth):
    def setUp(self) -> None:
        super(BuildsApiTestReadOnly, self).setUp()
        self.url = self.base_url + 'builds/'
        self.build_name = self.helper.random_build_name(4)
        self.test_object = Build.objects.create(
            name=self.build_name,
            description=self.helper.random_str(100),
            release_date=self.helper.random_date(),
            release_notes=self.helper.random_str(100),
            url=self.helper.random_url()
        )

        self.data_to_add = {
            'name': self.helper.random_build_name(4),
            'description': self.helper.random_str(100),
            'release_date': self.helper.random_date(),
            'release_notes': self.helper.random_str(100),
            'url': self.helper.random_url()
        }

    def test_get_builds(self):
        resp = self.client.get(self.url)
        self.check_code_200(resp)
        self.check_in_response(resp, self.test_object.as_dict())

    def test_get_build(self):
        resp = self.client.get(self.url + '{}/'.format(self.test_object.pk))
        self.check_code_200(resp)
        self.check_equal_response(resp, self.test_object.as_dict())

    def test_create_build(self):
        self.check_post_no_permissions(self.url)

    def test_update_build_name(self):
        self.check_put_no_permissions(self.url + '{}/'.format(self.test_object.pk))

    def test_delete_build(self):
        self.check_delete_no_permissions(self.url + '{}/'.format(self.test_object.pk))

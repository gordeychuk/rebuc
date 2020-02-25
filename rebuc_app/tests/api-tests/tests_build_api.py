from .common import ApiTestHelper
from rebuc_app.models import *


class BuildsApiTest(ApiTestHelper):
    def setUp(self) -> None:
        super(BuildsApiTest, self).setUp()
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

    def test_get_build_for_release(self):
        release = self.create_release_based_on_build(self.test_object.name)
        release.add_build(self.test_object)
        resp = self.client.get(self.url, {('release_id', release.id)})
        self.check_code_200(resp)
        self.check_in_response(resp, self.test_object.as_dict())

    def test_get_build_without_release(self):
        release = self.create_release_based_on_build(self.test_object.name)
        release.add_build(self.test_object)
        resp = self.client.get(self.url, {('release_id', "0")})
        self.check_code_200(resp)
        self.check_not_in_response(resp, self.test_object.as_dict())

    def test_get_build(self):
        resp = self.client.get(self.url + '{}/'.format(self.test_object.pk))
        self.check_code_200(resp)
        self.check_equal_response(resp, self.test_object.as_dict())

    def test_create_build(self):
        self.check_create_test_object()

    def test_create_build_invalid_name(self):
        self.check_create_invalid_value_too_long('name', self.helper.random_str(301), 300)

    def test_create_build_invalid_url(self):
        self.check_create_invalid_value_too_long('url', self.helper.random_str(2049), 2048)

    def test_create_build_invalid_release_date(self):
        self.data_to_add['release_date'] = self.helper.random_str(10)
        resp = self.client.post(self.url, self.data_to_add)
        self.check_code_400(resp)
        self.check_in_response(resp, 'Date has wrong format. Use one of these formats instead: YYYY-MM-DD.',
                               'release_date')
        resp_get = self.client.get(self.url)
        self.check_not_in_response(resp_get, resp.json())

    def test_create_build_required_name(self):
        self.check_required_field('name')

    def test_create_build_auto_detect_release(self):
        new_build_name = self.helper.random_build_name(4)
        self.data_to_add['name'] = new_build_name
        release = self.create_release_based_on_build(new_build_name)
        resp = self.client.post(self.url, self.data_to_add)
        build = Build.objects.get(pk=resp.json()['id'])
        self.assertTrue(release.has_build(build))

    def test_create_build_for_release(self):
        release = self.create_release_based_on_build(self.data_to_add['name'])
        self.data_to_add['release_id'] = release.id
        resp = self.client.post(self.url, self.data_to_add)
        build = Build.objects.get(pk=resp.json()['id'])
        self.assertTrue(release.has_build(build))

    def test_update_build_name(self):
        self.check_update_field('name', self.helper.random_build_name(4))

    def test_update_build_description(self):
        self.check_update_field('description', self.helper.random_str(1000))

    def test_update_build_release_date(self):
        self.check_update_field('release_date', self.helper.random_date())

    def test_update_build_release_notes(self):
        self.check_update_field('relase_notes', self.helper.random_str(2000))

    def test_update_build_url(self):
        self.check_update_field('url', self.helper.random_url())

    def test_update_release(self):
        release = self.create_release_based_on_build('1.0.0.0')
        self.data_to_add['name'] = '1.0.0.7'
        resp = self.client.post(self.url, self.data_to_add)
        self.data_to_add['release_id'] = '0'
        resp_put = self.client.put(self.url + str(resp.json()['id']) + '/', self.data_to_add)
        self.check_code_201(resp)
        self.check_code_200(resp_put)
        self.assertFalse(release.has_build(Build.objects.get(pk=resp.json()['id'])))

    def test_delete_build(self):
        resp = self.client.delete(self.url + '{}/'.format(self.test_object.id))
        self.check_code_204(resp)
        self.assertEqual(len(Build.objects.filter(pk=self.test_object.id)), 0, "Build still exists.")

from .common import ApiTestHelper
from django.utils.timezone import now
from rebuc_app.models import *


class ReleasesApiTest(ApiTestHelper):
    def setUp(self) -> None:
        super(ReleasesApiTest, self).setUp()
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
        self.check_create_test_object()

    def test_create_release_invalid_name(self):
        self.check_create_invalid_value_too_long('name', self.helper.random_str(301), 300)

    def test_create_release_invalid_start_build_no_id(self):
        self.data_to_add['release_pattern']['start_build'].pop('id')
        resp = self.client.post(self.url, self.data_to_add, format='json')
        self.check_code_400(resp)
        self.assertTrue('This field is required.' in resp.json()['release_pattern']['start_build']['id'])

    def test_create_release_invalid_start_build_no_invalid_id(self):
        self.data_to_add['release_pattern']['start_build']['id'] = 0
        resp = self.client.post(self.url, self.data_to_add, format='json')
        self.check_code_400(resp)
        self.assertTrue("Build with given ID is not found." in resp.json()['release_pattern']['start_build'])

    def test_create_release_invalid_start_build_mask_not_fit(self):
        new_start_build = Build.objects.create(name=self.helper.random_build_name(5),
                                               release_date=now(),
                                               url=self.helper.random_str(100))

        self.data_to_add['release_pattern'] = {
            'start_build': {'id': new_start_build.id}, 'build_mask': self.data_to_add['release_pattern']['build_mask']
        }
        resp = self.client.post(self.url, self.data_to_add, format='json')
        self.check_code_400(resp)
        self.assertTrue("Start instance doesn't fit instance mask pattern." in resp.json())

    def test_create_release_invalid_build_mask_not_int(self):
        self.data_to_add['release_pattern']['build_mask']['variable_octet'] = self.helper.random_ascii_str(2)
        resp = self.client.post(self.url, self.data_to_add, format='json')
        self.check_code_400(resp)
        self.assertTrue("A valid integer is required."
                        in resp.json()['release_pattern']['build_mask']['variable_octet'])

    def test_create_release_invalid_build_mask_octets(self):
        self.data_to_add['release_pattern']['build_mask'].pop('octets')
        resp = self.client.post(self.url, self.data_to_add, format='json')
        self.check_code_400(resp)
        self.assertTrue("This field is required." in resp.json()['release_pattern']['build_mask']['octets'])

    def test_create_release_invalid_build_mask_fixed_values(self):
        self.data_to_add['release_pattern']['build_mask'].pop('fixed_values')
        resp = self.client.post(self.url, self.data_to_add, format='json')
        self.check_code_400(resp)
        self.assertTrue("This field is required." in resp.json()['release_pattern']['build_mask']['fixed_values'])

    def test_create_release_invalid_build_mask_variable_octet(self):
        self.data_to_add['release_pattern']['build_mask'].pop('variable_octet')
        resp = self.client.post(self.url, self.data_to_add, format='json')
        self.check_code_400(resp)
        self.assertTrue("This field is required." in resp.json()['release_pattern']['build_mask']['variable_octet'])

    def test_create_release_invalid_release_date(self):
        self.data_to_add['release_date'] = self.helper.random_str(10)
        resp = self.client.post(self.url, self.data_to_add, format='json')
        self.check_code_400(resp)
        self.check_in_response(resp, 'Date has wrong format. Use one of these formats instead: YYYY-MM-DD.',
                               'release_date')
        resp_get = self.client.get(self.url)
        self.check_not_in_response(resp_get, resp.json())

    def test_create_release_required_name(self):
        self.check_required_field('name')

    def test_create_release_required_release_pattern(self):
        self.check_required_field('release_pattern')

    def test_create_release_required_start_build(self):
        self.check_required_field_nested('release_pattern', 'start_build')

    def test_create_release_required_build_mask(self):
        self.check_required_field_nested('release_pattern', 'build_mask')

    def test_update_release_name(self):
        self.check_update_field('name', self.helper.random_build_name(4))

    def test_update_release_description(self):
        self.check_update_field('description', self.helper.random_str(1000))

    def test_update_release_release_date(self):
        self.check_update_field('release_date', self.helper.random_date())

    def test_update_release_pattern_start_build(self):
        new_start_build = Build.objects.create(name=self.create_similar_build_name(self.build_name_to_add),
                                               release_date=now(),
                                               url=self.helper.random_str(100))
        self.check_update_field('release_pattern', {
            'start_build': {'id': new_start_build.id}, 'build_mask': self.data_to_add['release_pattern']['build_mask']
        })

    def test_update_release_pattern_build_pattern(self):
        new_build_name = self.helper.random_build_name(5)
        new_start_build = Build.objects.create(name=new_build_name,
                                               release_date=now(),
                                               url=self.helper.random_str(100))
        self.check_update_field('release_pattern', {
            'start_build': {'id': new_start_build.id},
            'build_mask': self.create_build_mask_data_based_on_build(new_build_name),
        })

    def test_delete_release(self):
        resp = self.client.delete(self.url + '{}/'.format(self.test_object.id))
        self.check_code_204(resp)
        self.assertEqual(len(Build.objects.filter(pk=self.test_object.id)), 0, "Build still exists.")

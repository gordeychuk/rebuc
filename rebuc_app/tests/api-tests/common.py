from rest_framework.test import APIClient
from django.test import TestCase
from django.contrib.auth.models import User
from rebuc_app.tests.test_helper import TestHelper
from rebuc_app.models import *
from django.utils.timezone import now


class ApiTestHelperNoAuth(TestCase):
    def setUp(self) -> None:
        self.client = APIClient()
        self.helper = TestHelper()
        self.username = 'testuser'
        self.first_name = 'Test'
        self.last_name = 'User'
        self.email = 'test@test.com'
        self.password = 'testpassword'
        self.user = User.objects.create_user(
            username=self.username,
            password=self.password,
            first_name=self.first_name,
            last_name=self.last_name,
            email=self.email,
            is_staff=False,
            is_superuser=False
        )
        self.base_url = 'http://localhost:8002/api-v1/'
        self.url = ''
        self.data_to_add = {}

    def check_code(self, response, code_to_check):
        """
        Checks status code of the response
        :param response: response to check
        :param code_to_check: target status code
        :return:
        """
        self.assertEqual(response.status_code, code_to_check, "Status code is incorrect: {} is not {}.".format(
            response.status_code, code_to_check
        ))

    def check_code_200(self, response):
        """
        Checks that status code of the response is 200
        :param response: target response
        :return:
        """
        self.check_code(response, 200)

    def check_code_201(self, response):
        """
        Checks that status code of the response is 201 (created)
        :param response: target response
        :return:
        """
        self.check_code(response, 201)

    def check_code_204(self, response):
        """
        Checks that status code of the response is 204 (deleted)
        :param response: target response
        :return:
        """
        self.check_code(response, 204)

    def check_code_400(self, response):
        """
        Checks that status code of the response is 400 (invalid data)
        :param response: target response
        :return:
        """
        self.check_code(response, 400)

    def check_code_401(self, response):
        """
        Checks that status code of the response is 403 (no auth credentials)
        :param response: target response
        :return:
        """
        self.check_code(response, 401)

    def check_code_405(self, response):
        """
        Checks that status code of the response is 405 (method not allowed)
        :param response: target response
        :return:
        """
        self.check_code(response, 405)

    def check_in_response(self, response, data_to_check, key=None):
        """
        Checks that target object exists in the json'ed response
        :param response: target response
        :param data_to_check: object as dict or string
        :param key: optional if target object in some key of the response
        :return:
        """
        response_data = response.json()
        if key:
            if key in response_data:
                response_data = response_data[key]
            else:
                AssertionError("Key {} not in response {}".format(key, response_data))
        self.assertTrue(data_to_check in response_data, "Data {} not in response {}.".format(
            data_to_check, response_data))

    def check_in_response_nested(self, response, data_to_check, key, parent):
        """
        Checks that target object exists in the json'ed nested response
        :param response: target response
        :param data_to_check: object as dict or string
        :param key: second level key in the response
        :param parent: first level key in the response
        :return:
        """
        response_data = response.json()
        if key in response_data[parent] and parent in response_data:
            response_data = response_data[parent][key]
        else:
            AssertionError("Key {} or parent {} not in response {}".format(key, parent, response_data))
        self.assertTrue(data_to_check in response_data, "Data {} not in response {}.".format(
            data_to_check, response_data))

    def check_not_in_response(self, response, data_to_check, key=None):
        """
        Checks that target object doesn't exist in the json'ed response
        :param response: target response
        :param data_to_check: object as dict or string
        :param key: optional if target object in some key of the response
        :return:
        """
        response_data = response.json()
        if key:
            if key in response_data:
                response_data = response_data[key]
            else:
                AssertionError("Key {} not in response {}".format(key, response_data))
        self.assertFalse(data_to_check in response_data, "Data {} not in response {}.".format(
            data_to_check, response_data))

    def check_equal_response(self, response, data_to_check, key=None):
        """
        Checks that target object is equal to the json'ed response
        :param response: target response
        :param data_to_check: object as dict or string
        :param key: optional if target object in some key of the response
        :return:
        """
        response_data = response.json()
        if key:
            if key in response_data:
                response_data = response_data[key]
            else:
                AssertionError("Key {} not in response {}".format(key, response_data))
        self.assertEqual(data_to_check, response_data, "Data {} not in response {}.".format(
            data_to_check, response_data))

    def check_error_in_field_long_string(self, response, field_name, string_limit):
        """
        Check that code 400 received and error about too long string returned for specified field
        :param response: Response object from self.client
        :param string_limit: string length limit in the response
        :param field_name: name of the field in the response
        :return: nothing
        """
        self.check_code_400(response)
        self.check_in_response(response, "Ensure this field has no more than {} characters.".format(string_limit),
                               field_name)

    def create_release(self, release_pattern):
        """
        Creates Release object
        :param release_pattern: instance pattern
        :return: Release object
        """
        return Release.objects.create(name=self.helper.random_ascii_str(5), release_pattern=release_pattern,
                                      release_date=now())

    def check_update_field(self, field_to_update, new_value):
        """
        Checks that field is updated after PUT request
        :param field_to_update: target field to update
        :param new_value: new value of the field
        :return:
        """
        resp_post = self.client.post(self.url, self.data_to_add, format='json')
        url_to_build = self.url + '{}/'.format(resp_post.json()['id'])
        self.data_to_add[field_to_update] = new_value
        resp = self.client.put(url_to_build, self.data_to_add, format='json')
        if resp.status_code == 400:
            print(resp.json())

        self.check_code_200(resp)
        resp_get = self.client.get(url_to_build)
        self.check_code_200(resp_get)
        self.check_equal_response(resp_get, resp.json())

    def check_required_field(self, field):
        """
        Checks that field is required for POST request
        :param field: target field
        :return:
        """
        self.data_to_add.pop(field)
        resp = self.client.post(self.url, self.data_to_add, format='json')
        self.check_code_400(resp)
        self.check_in_response(resp, 'This field is required.', field)

    def check_required_field_nested(self, parent, field):
        """
        Checks that field is required for POST request
        :param parent: first level in dict of the response
        :param field: target field
        :return:
        """
        self.data_to_add[parent].pop(field)
        resp = self.client.post(self.url, self.data_to_add, format='json')
        self.check_code_400(resp)
        self.check_in_response_nested(resp, 'This field is required.', field, parent)

    @staticmethod
    def create_build_mask_data_based_on_build(build_name):
        """
        Creates instance mask data based on instance
        :param build_name: name of the instance, should be capable to split by .
        :return: data for the instance mask object creation
        """
        build_name_octets_len = len(build_name.split('.'))
        return {
            'variable_octet': build_name_octets_len - 1,
            'octets': build_name_octets_len,
            'fixed_values': [int(octet) for octet in build_name.split('.')[:-1]]
        }

    def create_build_mask_based_on_build(self, build_name):
        """
        Creates instance mask based on field
        :param build_name: name of the instance
        :return: BuildMask object
        """
        return BuildMask.objects.create(**self.create_build_mask_data_based_on_build(build_name))

    def create_release_based_on_build(self, build_name):
        """
        Creates instance object based on instance name. Creates mask and start instance with 0 on the end.
        :param build_name: target instance name
        :return: Release object
        """
        start_build_name = '.'.join([_ for _ in build_name.split('.')][:-1]) + '.0'
        build_mask = self.create_build_mask_based_on_build(start_build_name)
        start_build = Build.objects.create(
            name=start_build_name,
            description=self.helper.random_str(100),
            release_date=self.helper.random_date(),
            release_notes=self.helper.random_str(100),
            url=self.helper.random_url()
        )
        release_pattern = ReleasePattern.objects.create(start_build=start_build, build_mask=build_mask)
        return self.create_release(release_pattern)

    def check_create_test_object(self):
        """
        Checks that test object can be created via POST request
        :return:
        """
        resp = self.client.post(self.url, self.data_to_add, format='json')
        if resp.status_code == 400:
            print(resp.json())
        self.check_code_201(resp)
        resp_get = self.client.get(self.url + '{}/'.format(resp.json()['id']))
        self.check_code_200(resp_get)
        self.check_equal_response(resp_get, resp.json())

    def check_create_invalid_value_too_long(self, field, invalid_value, limit):
        """
        Checks that test object can't be created with too long value
        :param field: target field
        :param invalid_value: invalid value
        :param limit: length limit
        :return:
        """
        self.data_to_add[field] = invalid_value
        resp = self.client.post(self.url, self.data_to_add, format='json')
        self.check_error_in_field_long_string(resp, field, limit)
        resp_get = self.client.get(self.url)
        self.check_not_in_response(resp_get, resp.json())

    @staticmethod
    def create_similar_build_name(build_name):
        """
        Creates instance name based on given instance name by adding 1 to the end of target instance name
        :param build_name: target instance name
        :return: instance name as string
        """
        build_name_splitted = build_name.split('.')
        new_build_name_arr = build_name_splitted[:-1]
        new_build_name_arr.append(str(int(build_name_splitted[-1]) + 1))
        return '.'.join([_ for _ in new_build_name_arr])

    def check_post_no_permissions(self, url):
        """
        Checks that request is not allowed for non-authenticated user
        :param url: url for POST
        :return:
        """
        resp = self.client.post(url, {})
        self.check_code_401(resp)
        self.check_in_response(resp, "Authentication credentials were not provided.", "detail")

    def check_put_no_permissions(self, url):
        """
        Checks that request is not allowed for non-authenticated user
        :param url: url for PUT
        :return:
        """
        resp = self.client.put(url, {})
        self.check_code_401(resp)
        self.check_in_response(resp, "Authentication credentials were not provided.", "detail")

    def check_delete_no_permissions(self, url):
        """
        Checks that request is not allowed for non-authenticated user
        :param url: url for DELETE
        :return:
        """
        resp = self.client.post(url, {})
        self.check_code_401(resp)
        self.check_in_response(resp, "Authentication credentials were not provided.", "detail")


class ApiTestHelper(ApiTestHelperNoAuth):
    def setUp(self) -> None:
        super(ApiTestHelper, self).setUp()
        self.client.force_authenticate(user=self.user)
        self.client.login(username=self.username, password=self.password)

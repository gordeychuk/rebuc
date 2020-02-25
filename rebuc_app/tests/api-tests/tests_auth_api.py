from .common import ApiTestHelperNoAuth


class ApiLoginTest(ApiTestHelperNoAuth):
    def setUp(self) -> None:
        super(ApiLoginTest, self).setUp()
        self.url = self.base_url + 'login/'

    def test_auth_success(self):
        response = self.client.post(self.url, {
            'username': self.username,
            'password': self.password
        })

        response_data = response.json()
        self.assertEqual(response.status_code, 200, "Status code is not valid")
        self.assertTrue(len(response_data['token']) > 0, "Token is empty")
        self.assertEqual(response_data['first_name'], self.first_name, "First name is not valid")
        self.assertEqual(response_data['last_name'], self.last_name, "Last name is not valid")

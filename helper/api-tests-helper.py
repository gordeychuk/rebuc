from django.test import Client, TestCase


class ApiTestHelper(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.api_prefix = 'api-v1/'


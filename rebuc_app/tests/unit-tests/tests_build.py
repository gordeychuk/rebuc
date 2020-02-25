from django.test import TestCase
from django.db import IntegrityError
from rebuc_app.models import Build
from .common import UnitTestHelper


class BuildUnitTestCase(TestCase, UnitTestHelper):
    def check_is_later(self, version_to_compare, version_later):
        build_to_compare_with = self.create_build(version_to_compare)
        build_later = self.create_build(version_later)
        self.assertTrue(build_later.is_later(build_to_compare_with), "is_later method works incorrectly")

    def test_create_build(self):
        build = self.create_build('1.1.1.1')
        self.assertEqual(build, Build.objects.get(pk=build.pk), 'Build is incorrect')

    def test_check_unique_build_name(self):
        self.create_build('1.1.1.1')
        with self.assertRaises(IntegrityError) as error:
            self.create_build('1.1.1.1')
        self.assertIsInstance(error.exception, IntegrityError, "Build with duplicate name has incorrect error")
        self.assertTrue("duplicate key value violates unique constraint" in str(error.exception),
                        "Build with duplicated name has incorrect error.")

    def check_build_as_string(self):
        build_name = '1.2.3.4.5'
        build = self.create_build(build_name)
        self.assertEqual(str(build), build_name, "String representation of the instance is incorrect")

    def test_build_is_lower_last_octet(self):
        self.check_is_later('1.2.3.4', '1.2.3.5')

    def test_build_is_lower_first_octet(self):
        self.check_is_later('1.2.3.4', '4.2.3.1')

    def test_build_is_lower_diff_octets_len(self):
        self.check_is_later('1.2.3.4', '1.2.3.4.5')

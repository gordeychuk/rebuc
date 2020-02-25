from django.test import TestCase
from django.utils.timezone import now
from django.db import IntegrityError
from rebuc_app.models import *
from .common import UnitTestHelper


class ReleseUnitTestCase(TestCase, UnitTestHelper):
    def setUp(self):
        super(ReleseUnitTestCase, self).setUp()
        self.start_build = self.create_build('1.0.0.10')
        self.build_mask = BuildMask.objects.create(variable_octet=3, octets=4, fixed_values=[1, 0, 0])
        self.release_pattern = ReleasePattern.objects.create(start_build=self.start_build, build_mask=self.build_mask)
        self.release = self.create_release()

    def create_release(self):
        return Release.objects.create(name='1.0', release_pattern=self.release_pattern, release_date=now())

    def test_create_release(self):
        self.assertEqual(self.release, Release.objects.get(pk=self.release.pk), 'Release is incorrect')

    def test_create_release_unique_name(self):
        with self.assertRaises(IntegrityError) as error:
            self.create_release()
        self.assertIsInstance(error.exception, IntegrityError, "Release with duplicate name has incorrect error")
        self.assertTrue("duplicate key value violates unique constraint" in str(error.exception),
                        "Release with duplicated name has incorrect error.")

    def test_create_release_required_release_pattern(self):
        with self.assertRaises(IntegrityError) as error:
            Release.objects.create(name='test', release_date=now())
        self.assertIsInstance(error.exception, IntegrityError, "Release with null instance date has incorrect error")
        self.assertTrue("violates not-null constraint" in str(error.exception),
                        "Release with null instance date has incorrect error.")

    def test_build_in_release(self):
        build_to_check = self.create_build('1.0.0.11')
        self.assertTrue(self.release.fit_to_release(build_to_check))

    def test_build_not_in_release_incorrect_start(self):
        build_to_check = self.create_build('1.0.0.1')
        self.assertFalse(self.release.fit_to_release(build_to_check))

    def test_build_not_in_release_incorrect_mask(self):
        build_to_check = self.create_build('1.0.1.11')
        self.assertFalse(self.release.fit_to_release(build_to_check))

    def test_add_build(self):
        build_to_add = self.create_build('1.0.0.5')
        self.assertFalse(self.release.has_build(build_to_add), "Release already has instance in builds array.")
        self.release.add_build(build_to_add)
        self.assertTrue(self.release.has_build(build_to_add), "Release doesn't have instance in builds array.")

    def test_remove_build(self):
        build_to_add = self.create_build('1.0.0.5')
        self.release.remove_build(build_to_add)
        self.assertFalse(self.release.has_build(build_to_add), "Release still have instance in builds array.")

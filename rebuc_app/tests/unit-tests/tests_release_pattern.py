from django.test import TestCase
from django.db import IntegrityError
from django.db.models.deletion import ProtectedError
from .common import UnitTestHelper
from rebuc_app.models import ReleasePattern, BuildMask


class ReleasePatternUnitTestCase(TestCase, UnitTestHelper):
    def setUp(self):
        self.start_build = self.create_build('1.0.0.1')
        self.build_mask = BuildMask.objects.create(variable_octet=3, octets=4, fixed_values=[1, 0, 0])
        self.release_pattern = ReleasePattern.objects.create(start_build=self.start_build, build_mask=self.build_mask)

    def test_create_release_pattern(self):
        self.assertEqual(self.release_pattern, ReleasePattern.objects.get(pk=self.release_pattern.pk))

    def test_create_release_null_mask(self):
        with self.assertRaises(IntegrityError) as error:
            ReleasePattern.objects.create(start_build=self.start_build)
        self.assertIsInstance(error.exception, IntegrityError,
                              "ReleasePattern with null start instance has incorrect error")
        self.assertTrue("violates not-null constraint" in str(error.exception),
                        "ReleasePattern with null start instance has incorrect error.")

    def test_cretate_relese_null_start_build(self):
        with self.assertRaises(IntegrityError) as error:
            ReleasePattern.objects.create(build_mask=self.build_mask)
        self.assertIsInstance(error.exception, IntegrityError,
                              "ReleasePattern with null instance mask has incorrect error")
        self.assertTrue("violates not-null constraint" in str(error.exception),
                        "ReleasePattern with null instance mask has incorrect error.")

    def test_delete_mask_check_cascade(self):
        self.build_mask.delete()
        self.assertEqual(0, len(ReleasePattern.objects.filter(pk=self.release_pattern.pk)),
                         "Release pattern not deleted when instance mask deleted.")

    def test_delete_build_check_protect(self):
        with self.assertRaises(IntegrityError) as error:
            self.start_build.delete()
        self.assertIsInstance(error.exception, ProtectedError,
                              "Attempt to delete start instance has incorrect error")

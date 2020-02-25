from django.test import TestCase
from rebuc_app.models import BuildMask
from .common import UnitTestHelper


class BuildMaskUnitTestCase(TestCase, UnitTestHelper):
    def setUp(self):
        self.build_mask = BuildMask(variable_octet=4, octets=5, fixed_values=[1, 2, 3, 4])
        self.build_mask_as_str = '1.2.3.4.X'

    def test_build_fit_mask(self):
        build = self.create_build('1.2.3.4.5')
        self.assertTrue(self.build_mask.fit_to_mask(build))

    def test_build_fit_mask_incorrect_fixed_values(self):
        build = self.create_build('4.2.3.4.5')
        self.assertFalse(self.build_mask.fit_to_mask(build))

    def test_build_fit_mask_incorrect_octets(self):
        build = self.create_build('1.2.3.4')
        self.assertFalse(self.build_mask.fit_to_mask(build))

    def test_check_buildmask_as_string(self):
        self.assertEqual(self.build_mask_as_str, str(self.build_mask))



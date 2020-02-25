from .test_helper import *
from rebuc_app.models import *


def create_releases():
    """
    Simple data for testing
    :return:
    """
    helper = TestHelper()
    for i in range(1, 40):
        start_build = Build.objects.create(name='{}.0.0.0'.format(i),
                                           release_date=helper.random_date(),
                                           release_notes=helper.random_ascii_str(50),
                                           description=helper.random_ascii_str(70),
                                           url='http://localhost/build-{}.0.0.0'.format(i)
                                           )
        build_mask = BuildMask.objects.create(variable_octet=3, octets=4, fixed_values=[i, 0, 0])
        release = Release.objects.create(name="R{}.0".format(i),
                                         description=helper.random_ascii_str(100),
                                         release_date=helper.random_date(),
                                         release_pattern=ReleasePattern.objects.create(
                                             start_build=start_build,
                                             build_mask=build_mask
                                         ))
        release.add_build(start_build)
        for j in range(1, 50):
            release.add_build(Build.objects.create(name='{}.0.0.{}'.format(i, j),
                                                   release_date=helper.random_date(),
                                                   release_notes=helper.random_ascii_str(50),
                                                   description=helper.random_ascii_str(75),
                                                   url='http://localhost/build-{}.0.0.{}'.format(i, j)
                                           ))

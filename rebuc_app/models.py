from django.db import models
from django.contrib.postgres.fields import ArrayField
from packaging.version import parse


class Build(models.Model):
    name = models.CharField(max_length=300, null=False, unique=True)
    description = models.TextField()
    url = models.CharField(max_length=2048)
    release_notes = models.TextField()
    release_date = models.DateField(null=True)

    def __str__(self):
        return self.name

    def is_later(self, build):
        """
        Compares two builds, return true if self was released later than instance from params
        :param build: instance to compare with
        :return: true or false
        """
        return parse(self.name) >= parse(build.name)

    def get_release(self):
        """
        Get release for build
        :return: Return release object if self build assigned to that release or None otherwise
        """
        for release in Release.objects.all():
            if release.has_build(self):
                return release
        return None

    def as_dict(self):
        """
        Object as a dictionary
        :return:
        """
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'url': self.url,
            'release_notes': self.release_notes,
            'release_date': self.release_date.strftime("%Y-%m-%d"),
        }


class BuildMask(models.Model):
    variable_octet = models.IntegerField(null=False)
    octets = models.IntegerField(null=False)
    fixed_values = ArrayField(models.IntegerField())

    def __str__(self):
        list_with_x = self.fixed_values
        list_with_x.insert(self.variable_octet, 'X')
        return '.'.join([str(_) for _ in list_with_x])

    def as_dict(self):
        """
        Object as a dictionary
        :return:
        """
        return {
            'variable_octet': self.variable_octet,
            'octets': self.octets,
            'fixed_values': [
                value for value in self.fixed_values
            ]
        }

    def is_same_build_mask(self, build_mask_data):
        """
        Checks if given data is the same as existing instance mask
        :param build_mask_data: data to compare
        :return: True or False
        """
        for field in build_mask_data.keys():
            if build_mask_data[field] != getattr(self, field):
                return False
        return True

    def fit_to_mask(self, build):
        """
        Checks if instance fits to the instance mask. For example 1.2.3.0 fix to the mask 1.2.X.0
        :param build:
        :return:
        """
        build_values = build.name.split('.')
        if len(build_values) != self.octets:
            return False
        build_values.pop(self.variable_octet)
        if len(build_values) != len(self.fixed_values):
            return False
        for i in range(len(self.fixed_values)):
            if str(self.fixed_values[i]) != build_values[i]:
                return False
        return True


class ReleasePattern(models.Model):
    build_mask = models.ForeignKey(BuildMask, null=False, on_delete=models.CASCADE)
    start_build = models.ForeignKey(Build, null=False, on_delete=models.PROTECT)

    def __str__(self):
        return '{}, start from {}'.format(self.build_mask, self.start_build)

    def fit_to_pattern(self, build):
        """
        Chceks if instance fits to instance mask and released later than start instance
        :param build:
        :return:
        """
        return build.is_later(self.start_build) and self.build_mask.fit_to_mask(build)

    def as_dict(self):
        """
        Object as a dictionary
        :return:
        """
        return {
            'build_mask': str(self.build_mask),
            'start_build': {'id': self.start_build.id, 'name': self.start_build.name},
        }

    def is_start_build(self, build_id):
        """
        Checks if given build_id is the same as associated start_build
        :param build_id:
        :return: True or False
        """
        return self.start_build.id == build_id

    def is_same_build_mask(self, build_mask_id):
        """
        Checks if given instance mask is the same as existing instance mask
        :param build_mask_id:
        :return: True or False
        """
        return self.build_mask.id == build_mask_id


class Release(models.Model):
    name = models.CharField(max_length=300, null=False, unique=True)
    description = models.TextField()
    release_date = models.DateField(null=True)
    builds = models.ManyToManyField(Build, blank=True)
    release_pattern = models.ForeignKey(ReleasePattern, on_delete=models.CASCADE, null=False)

    def __str__(self):
        return '{}, pattern: {}'.format(self.name, self.release_pattern)

    def fit_to_release(self, build):
        """
        Checks if instance fits instance pattern and can be added
        :param build: instance to check
        :return: True if instance can be added into instance, False otherwise
        """
        return self.release_pattern.fit_to_pattern(build)

    def add_build(self, build):
        """
        Add instance into instance
        :param build: instance to add
        :return: nothing
        """
        self.builds.add(build)

    def remove_build(self, build):
        """
        Removes instance from instance
        :param build: instance to remove
        :return: nothing
        """
        self.builds.remove(build)

    def has_build(self, build):
        """
        Checks if instance is in builds field of the instance
        :param build: instance to check
        :return: True if instance in instance field, False otherwise
        """
        return build in self.builds.all()

    def as_dict(self):
        """
        Object as a dictionary
        :return:
        """
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "release_date": self.release_date.strftime("%Y-%m-%d"),
            "builds": [str(build) for build in self.builds.all()],
            "release_pattern": self.release_pattern.as_dict()
        }


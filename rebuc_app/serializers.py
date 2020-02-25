from rest_framework.serializers import HyperlinkedModelSerializer, ValidationError, CharField
from .models import *


class BuildSerializer(HyperlinkedModelSerializer):
    release_id = CharField(required=False)

    class Meta:
        model = Build
        fields = ['id', 'name', 'release_date', 'description', 'url', 'release_notes', 'release_id']
        extra_kwargs = {
            'url': {'required': False},
            'release_notes': {'required': False, 'allow_blank': True},
            'description': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        release_id = None
        if 'release_id' in validated_data:
            release_id = validated_data.pop('release_id')
        build_without_release = Build.objects.create(**validated_data)
        if release_id and release_id != "0":
            target_release = Release.objects.get(pk=self.validated_data['release_id'])
            if target_release.fit_to_release(build_without_release):
                target_release.add_build(build_without_release)
            else:
                raise ValidationError('Build doesn\'t fit release pattern.')
        else:
            for release in Release.objects.all():
                if release.fit_to_release(build_without_release):
                    release.add_build(build_without_release)
        return build_without_release

    def update(self, instance, validated_data):
        def add_to_release_or_error():
            release = Release.objects.get(pk=self.validated_data['release_id'])
            if release.fit_to_release(instance):
                release.add_build(instance)
            else:
                raise ValidationError('Build doesn\'t fit release pattern.')

        current_release = instance.get_release()
        print(current_release)
        if 'release_id' in validated_data:
            new_release_id = validated_data.pop('release_id')
            print(current_release)
            if not current_release:
                if new_release_id != '0':
                    add_to_release_or_error()
            else:
                if str(current_release.id) != new_release_id:
                    if new_release_id == '0':
                        current_release.remove_build(instance)
                    else:
                        add_to_release_or_error()
                        current_release.remove_build(instance)
        return super(BuildSerializer, self).update(instance, validated_data)


class BuildNotRequiredFieldsSerializer(HyperlinkedModelSerializer):
    """
    Simplified build serializtion as a simple string for release serizalizer
    """
    class Meta:
        model = Build
        fields = ['id', 'name', 'release_date', 'description', 'url', 'release_notes']
        extra_kwargs = {
            'id': {'read_only': False},
            'name': {'required': False},
            'release_date': {'required': False},
            'release_notes': {'required': False},
            'description': {'required': False},
            'url': {'required': False},
        }

    def to_representation(self, instance):
        return str(instance.name)


class BuildMaskSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = BuildMask
        fields = '__all__'

    def to_representation(self, instance):
        return str(instance)


class ReleasePatternSerializer(HyperlinkedModelSerializer):
    start_build = BuildNotRequiredFieldsSerializer(many=False, required=True)
    build_mask = BuildMaskSerializer(many=False, required=True)

    class Meta:
        model = ReleasePattern
        fields = '__all__'

    def to_representation(self, instance):
        return {
            'start_build': {'id': instance.start_build.id, 'name': instance.start_build.name},
            'build_mask': str(instance.build_mask)
        }

    @staticmethod
    def validate_start_build(value):
        if 'id' not in value:
            raise ValidationError("ID is missing for start_build.")
        start_build = Build.objects.filter(pk=value['id'])
        if not start_build:
            raise ValidationError("Build with given ID is not found.")
        return start_build[0]

    @staticmethod
    def validate_build_mask(value):
        def _check_if_int(val, key):
            if not isinstance(val, int):
                raise ValidationError("{} is not int.".format(key))

        required_fields = ['variable_octet', 'octets', 'fixed_values']
        for field in required_fields:
            if field not in value:
                raise ValidationError("{} field is missing for build_mask.".format(field))

        _check_if_int(value['variable_octet'], 'variable_octet')
        _check_if_int(value['octets'], 'octets')
        for fixed_value in value['fixed_values']:
            _check_if_int(fixed_value, 'fixed_values')

        if value['octets'] <= 0:
            raise ValidationError("Octets should be higher than zero.")

        if value['variable_octet'] > value['octets'] - 1:
            raise ValidationError("Variable octet is higher than total number of octets.")

        if len(value['fixed_values']) + 1 != value['octets']:
            raise ValidationError("Len of fixed values is more than total number of octets.")

        return BuildMask.objects.create(variable_octet=value['variable_octet'], octets=value['octets'],
                                        fixed_values=value['fixed_values'])

    def create(self, validated_data):
        if validated_data["build_mask"].fit_to_mask(validated_data['start_build']):
            return ReleasePattern.objects.create(**validated_data)
        raise ValidationError("Start build doesn't fit build mask pattern.")


class ReleaseSerializer(HyperlinkedModelSerializer):
    builds = BuildNotRequiredFieldsSerializer(many=True, required=False)
    release_pattern = ReleasePatternSerializer(many=False)

    class Meta:
        model = Release
        fields = ('id', 'name', 'release_date', 'description', 'builds', 'release_pattern')
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'release_date': {'allow_null': True},
            'builds': {'read_only': True}
        }

    def validate_empty_values(self, data):
        if data['release_date'] == '':
            data.pop('release_date')
        return super(ReleaseSerializer, self).validate_empty_values(data)

    def create(self, validated_data):
        release_pattern_data = validated_data.pop('release_pattern')
        if release_pattern_data['build_mask'].fit_to_mask(release_pattern_data['start_build']):
            validated_data['release_pattern'] = ReleasePattern.objects.create(**release_pattern_data)
        else:
            raise ValidationError("Start build doesn't fit build mask pattern.")
        release = Release.objects.create(**validated_data)
        release.add_build(release.release_pattern.start_build)
        return release

    def update(self, instance, validated_data):
        release_pattern_data = validated_data.pop('release_pattern')
        if not instance.release_pattern.is_start_build(release_pattern_data['start_build'].id) or \
                not instance.release_pattern.is_same_build_mask(release_pattern_data['build_mask'].id):
            instance.release_pattern.delete()
            if release_pattern_data['build_mask'].fit_to_mask(release_pattern_data['start_build']):
                validated_data['release_pattern'] = ReleasePattern.objects.create(**release_pattern_data)
            else:
                raise ValidationError("Start build doesn't fit build mask pattern.")

        else:
            validated_data['release_pattern'] = ReleasePattern.objects.get(pk=instance.release_pattern.id)
        return super(ReleaseSerializer, self).update(instance, validated_data)





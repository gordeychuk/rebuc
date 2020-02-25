from .serializers import *
from rest_framework import viewsets, permissions
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.views.generic import TemplateView
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
import logging
logger = logging.getLogger(__name__)

index = TemplateView.as_view(template_name='index.html')


@permission_classes((permissions.AllowAny,))
class Login(ViewSet):
    @staticmethod
    def create(request):
        username = request.data.get("username")
        password = request.data.get("password")
        if username is None or password is None:
            return Response({'error': 'Please provide both username and password'},
                            status=HTTP_400_BAD_REQUEST)
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid Credentials'},
                            status=HTTP_404_NOT_FOUND)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_admin': user.is_superuser,
            'avatar_url': 'https://api.adorable.io/avatars/face/eyes5/nose4/mouth6/eeeeff'
            if user.is_superuser else 'https://api.adorable.io/avatars/face/eyes1/nose2/mouth4/ffeeff'
        },
            status=HTTP_200_OK)


class ReleaseViewSet(viewsets.ModelViewSet):
    base_model = Release
    serializer_class = ReleaseSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = Release.objects.all()


class BuildViewSet(viewsets.ModelViewSet):
    base_model = Build
    serializer_class = BuildSerializer
    permission_classes = (IsAuthenticatedOrReadOnly, )

    def get_queryset(self):
        queryset = Build.objects.all()
        release_id = self.request.query_params.get('release_id', None)
        if release_id is not None:
            if release_id[-1] == '/':
                release_id = release_id[:-1]
            if release_id == '0':
                queryset = queryset.filter(release=None)
            else:
                queryset = queryset.filter(release__id=release_id)
        return queryset

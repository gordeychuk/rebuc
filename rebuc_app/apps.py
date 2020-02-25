from django.apps import AppConfig


class RebucAppConfig(AppConfig):
    name = 'rebuc_app'

    def ready(self):
        import rebuc_app.signals

import os

from django.core.asgi import get_asgi_application

from channels.routing import (
    ProtocolTypeRouter,
    URLRouter,
)

from security.middleware import JwtAuthMiddleware

import kitchen.routing
import audits.routing
import security.routing

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings.production",
)

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({

    "http": django_asgi_app,

    "websocket": JwtAuthMiddleware(

        URLRouter(
            kitchen.routing.websocket_urlpatterns
            + audits.routing.websocket_urlpatterns
            + security.routing.websocket_urlpatterns
        )

    ),
})
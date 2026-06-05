from urllib.parse import parse_qs

from channels.db import database_sync_to_async

from rest_framework_simplejwt.tokens import AccessToken

from accounts.models import User

from django.http import JsonResponse

from security.models import UserSession


@database_sync_to_async
def get_user(token):

    try:
        access_token = AccessToken(token)

        user_id = access_token["user_id"]

        return User.objects.get(id=user_id)

    except Exception:
        return None


class JwtAuthMiddleware:

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):

        query_string = scope["query_string"].decode()

        params = parse_qs(query_string)

        token = params.get("token")

        if token:
            scope["user"] = await get_user(token[0])

        else:
            scope["user"] = None

        return await self.app(
            scope,
            receive,
            send,
        )



class ActiveSessionMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        if (
            request.user.is_authenticated
            and request.session.session_key
        ):

            exists = UserSession.objects.filter(
                user=request.user,
                session_key=request.session.session_key,
                is_active=True,
            ).exists()

            if not exists:

                return JsonResponse(
                    {
                        "detail": "Session expired"
                    },
                    status=401,
                )

        return self.get_response(request)
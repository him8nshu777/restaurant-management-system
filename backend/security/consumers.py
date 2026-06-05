import json

from channels.generic.websocket import AsyncWebsocketConsumer


class UserSessionConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.restaurant_id = self.scope["url_route"]["kwargs"]["restaurant_id"]

        self.group_name = f"security_{self.restaurant_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(
        self,
        close_code,
    ):

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    async def session_created(
        self,
        event,
    ):

        await self.send(text_data=json.dumps(event["data"]))

    async def session_removed(
        self,
        event,
    ):

        await self.send(
            text_data=json.dumps(
                {
                    "event": "session_removed",
                    **event["data"],
                }
            )
        )


from channels.generic.websocket import AsyncJsonWebsocketConsumer


class SessionConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):

        user = self.scope.get("user")
        print("WS CONNECT USER:", user)
        if user.is_anonymous:
            print("ANONYMOUS USER REJECTED")
            await self.close()
            return

        self.group_name = f"user_{user.id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()
        print(
            "WS USER:",
            self.scope["user"],
        )
        print(
        "CONNECTED:",self.group_name
    )

    async def disconnect(self, close_code):

        user = self.scope.get("user")

        if user:

            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name,
            )

    async def force_logout(self, event):

        print(
            "FORCE LOGOUT RECEIVED:",
            self.group_name
        )
        await self.send_json({
            "type": "force_logout",
            "message": event["message"],
            "logout_all": event.get("logout_all", False),
        })


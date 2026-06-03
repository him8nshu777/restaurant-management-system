import json

from channels.generic.websocket import AsyncWebsocketConsumer


class AuditLogConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.restaurant_id = self.scope["url_route"]["kwargs"]["restaurant_id"]

        self.group_name = f"audit_{self.restaurant_id}"

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

    async def activity_log_created(
        self,
        event,
    ):

        await self.send(text_data=json.dumps(event["data"]))

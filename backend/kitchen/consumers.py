import json

from channels.generic.websocket import (
    AsyncWebsocketConsumer
)


class KitchenConsumer(
    AsyncWebsocketConsumer
):

    async def connect(self):

        self.restaurant_id = self.scope[
            "url_route"
        ]["kwargs"]["restaurant_id"]

        self.group_name = (
            f"kitchen_{self.restaurant_id}"
        )

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(
        self,
        close_code
    ):

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    # =====================================
    # SEND EVENT TO FRONTEND
    # =====================================
    async def send_order_event(
        self,
        event
    ):

        await self.send(
            text_data=json.dumps(
                event["data"]
            )
        )

class WaiterConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.waiter_id = self.scope["url_route"]["kwargs"]["waiter_id"]

        self.group_name = f"waiter_{self.waiter_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def send_order_event(self, event):

        await self.send(
            text_data=json.dumps(event["data"])
        )


# ==========================================
# DELIVERY CONSUMER
# ==========================================
class DeliveryConsumer(
    AsyncWebsocketConsumer
):

    async def connect(self):

        self.restaurant_id = self.scope[
            "url_route"
        ]["kwargs"]["restaurant_id"]

        self.group_name = (
            f"delivery_{self.restaurant_id}"
        )

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(
        self,
        close_code
    ):

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    async def send_order_event(
        self,
        event
    ):

        await self.send(
            text_data=json.dumps(
                event["data"]
            )
        )
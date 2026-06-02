from datetime import timedelta, datetime

from django.db.models import (
    Sum,
    Count,
    Avg,
)

from django.db.models.functions import (
    TruncDate,
    ExtractQuarter,
)

from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from orders.models import Order
from restaurants.models import Restaurant

from orders.models import (
    OrderItem,
)
from django.db.models.functions import ExtractHour


class SalesReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        restaurant_id = request.GET.get("restaurant_id")

        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")
        period = request.GET.get(
            "period",
            "week",
        )

        # ===================================
        # RESTAURANT ACCESS CHECK
        # ===================================

        if user.role == "restaurant_admin":

            restaurant = Restaurant.objects.filter(
                id=restaurant_id,
                owner=user,
            ).first()

        else:

            restaurant = Restaurant.objects.filter(
                id=restaurant_id,
            ).first()

            if not restaurant or user.restaurant_id != restaurant.id:
                return Response(
                    {"detail": "Access denied"},
                    status=403,
                )

        if not restaurant:

            return Response(
                {"detail": "Restaurant not found"},
                status=404,
            )

        # ===================================
        # BASE QUERYSET
        # ===================================

        queryset = Order.objects.filter(
            restaurant=restaurant,
            payment_status="paid",
        )

        use_custom_range = start_date and end_date

        today = timezone.localdate()

        def parse_date(d):
            return datetime.strptime(d, "%Y-%m-%d").date()

        # ===================================
        # CUSTOM DATE RANGE (NEW FEATURE)
        # ===================================

        if use_custom_range:

            start_date_obj = parse_date(start_date)
            end_date_obj = parse_date(end_date)

            queryset = queryset.filter(
                created_at__date__range=[start_date_obj, end_date_obj]
            )

            diff_days = (end_date_obj - start_date_obj).days

            labels = []
            sales = []

            current = start_date_obj

            # DAILY (<= 10 days)
            if diff_days <= 10:

                while current <= end_date_obj:

                    total = (
                        queryset.filter(created_at__date=current).aggregate(
                            total=Sum("grand_total")
                        )["total"]
                        or 0
                    )

                    labels.append(current.strftime("%d %b"))
                    sales.append(float(total))

                    current += timedelta(days=1)

            # WEEKLY (<= 60 days)
            elif diff_days <= 60:

                while current <= end_date_obj:

                    week_end = current + timedelta(days=6)

                    total = (
                        queryset.filter(
                            created_at__date__gte=current,
                            created_at__date__lte=week_end,
                        ).aggregate(total=Sum("grand_total"))["total"]
                        or 0
                    )

                    labels.append(
                        f"{current.strftime('%d %b')} - {week_end.strftime('%d %b')}"
                    )
                    sales.append(float(total))

                    current += timedelta(days=7)

            # MONTHLY (> 60 days)
            else:

                from django.db.models.functions import TruncMonth

                monthly_data = (
                    queryset.annotate(month=TruncMonth("created_at"))
                    .values("month")
                    .annotate(total=Sum("grand_total"))
                    .order_by("month")
                )

                for item in monthly_data:
                    labels.append(item["month"].strftime("%b %Y"))
                    sales.append(float(item["total"] or 0))
        # ===================================
        # WEEK
        # ===================================

        elif period == "week":

            start_date = today - timedelta(days=today.weekday())

            queryset = queryset.filter(created_at__date__gte=start_date)

            labels = []

            sales = []

            current = start_date

            while current <= today:

                total = (
                    queryset.filter(created_at__date=current).aggregate(
                        total=Sum("grand_total")
                    )["total"]
                    or 0
                )

                labels.append(current.strftime("%a"))

                sales.append(float(total))

                current += timedelta(days=1)

        # ===================================
        # MONTH
        # ===================================

        elif period == "month":

            queryset = queryset.filter(
                created_at__year=today.year,
                created_at__month=today.month,
            )

            labels = [
                "Week 1",
                "Week 2",
                "Week 3",
                "Week 4",
                "Week 5",
            ]

            sales = []

            for week in range(5):

                start_day = (week * 7) + 1

                end_day = start_day + 6

                total = (
                    queryset.filter(
                        created_at__day__gte=start_day,
                        created_at__day__lte=end_day,
                    ).aggregate(total=Sum("grand_total"))["total"]
                    or 0
                )

                sales.append(float(total))

        # ===================================
        # YEAR
        # ===================================

        else:

            queryset = queryset.filter(created_at__year=today.year)

            quarter_data = (
                queryset.annotate(quarter=ExtractQuarter("created_at"))
                .values("quarter")
                .annotate(total=Sum("grand_total"))
                .order_by("quarter")
            )

            labels = [
                "January-March",
                "April-June",
                "July-Sept",
                "October-December",
            ]

            sales = [0, 0, 0, 0]

            for item in quarter_data:

                sales[item["quarter"] - 1] = float(item["total"])

        # ===================================
        # SUMMARY CARDS
        # ===================================

        summary = queryset.aggregate(
            total_sales=Sum("grand_total"),
            total_orders=Count("id"),
            average_order_value=Avg("grand_total"),
        )

        return Response(
            {
                "period": period,
                "restaurant": {
                    "id": restaurant.id,
                    "name": restaurant.name,
                },
                "summary": {
                    "total_sales": float(summary["total_sales"] or 0),
                    "total_orders": summary["total_orders"] or 0,
                    "average_order_value": float(summary["average_order_value"] or 0),
                },
                "chart": {
                    "labels": labels,
                    "sales": sales,
                },
            }
        )


class ProductReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        restaurant_id = request.GET.get(
            "restaurant_id"
        )

        period = request.GET.get(
            "period",
            "week",
        )

        report_type = request.GET.get(
            "report_type",
            "best",
        )

        start_date = request.GET.get(
            "start_date"
        )

        end_date = request.GET.get(
            "end_date"
        )

        # ============================
        # RESTAURANT
        # ============================

        if user.role == "restaurant_admin":

            restaurant = Restaurant.objects.filter(
                id=restaurant_id,
                owner=user,
            ).first()

        else:

            restaurant = Restaurant.objects.filter(
                id=restaurant_id
            ).first()

            if (
                not restaurant
                or user.restaurant_id
                != restaurant.id
            ):
                return Response(
                    {
                        "detail":
                        "Access denied"
                    },
                    status=403,
                )

        if not restaurant:

            return Response(
                {
                    "detail":
                    "Restaurant not found"
                },
                status=404,
            )

        today = timezone.localdate()

        queryset = OrderItem.objects.filter(
            order__restaurant=restaurant,
            product_variant__isnull=False,
        ).exclude(
            order__status="cancelled"
        )

        # ============================
        # DATE FILTER
        # ============================

        if start_date and end_date:

            queryset = queryset.filter(
                order__created_at__date__range=[
                    start_date,
                    end_date,
                ]
            )

        elif period == "week":

            start = (
                today -
                timedelta(
                    days=today.weekday()
                )
            )

            queryset = queryset.filter(
                order__created_at__date__gte=start
            )

        elif period == "month":

            queryset = queryset.filter(
                order__created_at__year=today.year,
                order__created_at__month=today.month,
            )

        elif period == "year":

            queryset = queryset.filter(
                order__created_at__year=today.year
            )

        # ============================
        # PRODUCT DATA
        # ============================

        products = (
            queryset
            .values(
                "product_variant__product__name",
                "product_variant__name",
            )
            .annotate(
                quantity_sold=Sum(
                    "quantity"
                )
            )
        )

        if report_type == "best":

            products = products.order_by(
                "-quantity_sold"
            )[:10]

        else:

            products = products.order_by(
                "quantity_sold"
            )[:10]

        labels = []

        quantities = []

        for item in products:

            labels.append(
                f"{item['product_variant__product__name']} - "
                f"{item['product_variant__name']}"
            )

            quantities.append(
                item["quantity_sold"]
            )

        total_qty = queryset.aggregate(
            total=Sum("quantity")
        )["total"] or 0

        return Response(
            {
                "report_type":
                    report_type,

                "summary": {

                    "total_quantity":
                        total_qty,

                    "unique_products":
                        queryset
                        .values(
                            "product_variant"
                        )
                        .distinct()
                        .count(),

                    "best_product":
                        labels[0]
                        if labels
                        else None,

                    "best_quantity":
                        quantities[0]
                        if quantities
                        else 0,
                },

                "chart": {
                    "labels":
                        labels,

                    "quantities":
                        quantities,
                },
            }
        )
    
class TimeAnalysisReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        restaurant_id = request.GET.get("restaurant_id")

        period = request.GET.get(
            "period",
            "week"
        )

        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")

        # ==========================
        # RESTAURANT ACCESS
        # ==========================

        if user.role == "restaurant_admin":

            restaurant = Restaurant.objects.filter(
                id=restaurant_id,
                owner=user,
            ).first()

        else:

            restaurant = Restaurant.objects.filter(
                id=restaurant_id
            ).first()

            if (
                not restaurant
                or user.restaurant_id != restaurant.id
            ):
                return Response(
                    {"detail": "Access denied"},
                    status=403
                )

        if not restaurant:
            return Response(
                {"detail": "Restaurant not found"},
                status=404
            )

        # ==========================
        # BASE QUERYSET
        # ==========================

        queryset = Order.objects.filter(
            restaurant=restaurant,
            
        ).exclude(
            status="cancelled"
        )

        today = timezone.localdate()

        # ==========================
        # CUSTOM RANGE
        # ==========================

        if start_date and end_date:

            start_obj = datetime.strptime(
                start_date,
                "%Y-%m-%d"
            ).date()

            end_obj = datetime.strptime(
                end_date,
                "%Y-%m-%d"
            ).date()

            queryset = queryset.filter(
                created_at__date__range=[
                    start_obj,
                    end_obj,
                ]
            )

        elif period == "week":

            week_start = (
                today
                - timedelta(days=today.weekday())
            )

            queryset = queryset.filter(
                created_at__date__gte=week_start
            )

        elif period == "month":

            queryset = queryset.filter(
                created_at__year=today.year,
                created_at__month=today.month,
            )

        else:

            queryset = queryset.filter(
                created_at__year=today.year
            )

        # ==========================
        # HOUR ANALYSIS
        # ==========================

        hour_data = (
            queryset
            .annotate(
                hour=ExtractHour("created_at")
            )
            .values("hour")
            .annotate(
                orders=Count("id")
            )
            .order_by("hour")
        )

        hourly_map = {
            item["hour"]: item["orders"]
            for item in hour_data
        }

        labels = []
        orders = []

        for hour in range(24):

            labels.append(
                f"{hour:02d}:00"
            )

            orders.append(
                hourly_map.get(hour, 0)
            )

        peak_index = (
            orders.index(max(orders))
            if orders
            else 0
        )

        slow_index = (
            orders.index(min(orders))
            if orders
            else 0
        )

        return Response({

            "peak_hour": labels[peak_index],
            "peak_orders": orders[peak_index],

            "slow_hour": labels[slow_index],
            "slow_orders": orders[slow_index],

            "chart": {
                "labels": labels,
                "orders": orders,
            }
        })
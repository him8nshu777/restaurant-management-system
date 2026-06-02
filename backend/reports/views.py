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

class SalesReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        restaurant_id = request.GET.get(
            "restaurant_id"
        )

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
                        queryset.filter(
                            created_at__date=current
                        ).aggregate(
                            total=Sum("grand_total")
                        )["total"] or 0
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
                        ).aggregate(
                            total=Sum("grand_total")
                        )["total"] or 0
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
                    queryset
                    .annotate(month=TruncMonth("created_at"))
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

            start_date = (
                today
                - timedelta(
                    days=today.weekday()
                )
            )

            queryset = queryset.filter(
                created_at__date__gte=start_date
            )

            labels = []

            sales = []

            current = start_date

            while current <= today:

                total = (
                    queryset.filter(
                        created_at__date=current
                    ).aggregate(
                        total=Sum(
                            "grand_total"
                        )
                    )["total"]
                    or 0
                )

                labels.append(
                    current.strftime("%a")
                )

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

                start_day = (
                    week * 7
                ) + 1

                end_day = (
                    start_day + 6
                )

                total = (
                    queryset.filter(
                        created_at__day__gte=start_day,
                        created_at__day__lte=end_day,
                    ).aggregate(
                        total=Sum(
                            "grand_total"
                        )
                    )["total"]
                    or 0
                )

                sales.append(float(total))

        # ===================================
        # YEAR
        # ===================================

        else:

            queryset = queryset.filter(
                created_at__year=today.year
            )

            quarter_data = (
                queryset
                .annotate(
                    quarter=ExtractQuarter(
                        "created_at"
                    )
                )
                .values("quarter")
                .annotate(
                    total=Sum(
                        "grand_total"
                    )
                )
                .order_by(
                    "quarter"
                )
            )

            labels = [
                "January-March",
                "April-June",
                "July-Sept",
                "October-December",
            ]

            sales = [0, 0, 0, 0]

            for item in quarter_data:

                sales[
                    item["quarter"] - 1
                ] = float(
                    item["total"]
                )

        # ===================================
        # SUMMARY CARDS
        # ===================================

        summary = queryset.aggregate(
            total_sales=Sum(
                "grand_total"
            ),
            total_orders=Count("id"),
            average_order_value=Avg(
                "grand_total"
            ),
        )

        return Response(
            {
                "period": period,

                "restaurant": {
                    "id": restaurant.id,
                    "name": restaurant.name,
                },

                "summary": {
                    "total_sales":
                        float(
                            summary[
                                "total_sales"
                            ]
                            or 0
                        ),

                    "total_orders":
                        summary[
                            "total_orders"
                        ]
                        or 0,

                    "average_order_value":
                        float(
                            summary[
                                "average_order_value"
                            ]
                            or 0
                        ),
                },

                "chart": {
                    "labels": labels,
                    "sales": sales,
                },
            }
        )
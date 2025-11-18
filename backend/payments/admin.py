from django.contrib import admin

# Register your models here.

from django.contrib import admin
from django.db.models import Sum
from django.urls import path
from django.shortcuts import render
from .models import Payment, PaymentLog


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("user", "hyperpay_transaction_id", "amount", "status", "currency", "created_at")
    list_filter = ("status", "currency", "created_at")
    search_fields = ("user__username", "order_id", "hyperpay_transaction_id")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("summary/", self.admin_site.admin_view(self.summary_view)),
        ]
        return custom_urls + urls

    def summary_view(self, request):
        stats = {
            "total_paid": Payment.objects.filter(status="paid").aggregate(Sum("amount"))["amount__sum"] or 0,
            "count_paid": Payment.objects.filter(status="paid").count(),
            "count_failed": Payment.objects.filter(status="failed").count(),
            "count_pending": Payment.objects.filter(status="pending").count(),
        }
        return render(request, "admin/payment_summary.html", {"stats": stats})


@admin.register(PaymentLog)
class PaymentLogAdmin(admin.ModelAdmin):
    list_display = ("payment", "status", "received_at")
    list_filter = ("status",)
    search_fields = ("payment__transaction_id",)
    readonly_fields = ("raw_data", "received_at")

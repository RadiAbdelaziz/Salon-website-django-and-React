from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
from django.utils import timezone

class Payment(models.Model):
    STATUS_PENDING = "pending"
    STATUS_PROCESSING = "processing"
    STATUS_PAID = "paid"
    STATUS_FAILED = "failed"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_PROCESSING, "Processing"),
        (STATUS_PAID, "Paid"),
        (STATUS_FAILED, "Failed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    order_id = models.CharField(max_length=128, null=True, blank=True)
    hyperpay_checkout_id = models.CharField(max_length=128, null=True, blank=True)
    hyperpay_transaction_id = models.CharField(max_length=128, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='SAR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    raw_response = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.order_id or self.pk} | {self.amount} {self.currency} | {self.status}"


# payment log 

class PaymentLog(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True)
    raw_data = models.JSONField()
    status = models.CharField(max_length=50)
    received_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Log for {self.payment} at {self.received_at}"

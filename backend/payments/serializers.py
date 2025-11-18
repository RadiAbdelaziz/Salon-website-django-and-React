from rest_framework import serializers

class CreatePaymentSerializer(serializers.Serializer):
    order_id = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(default='SAR', required=False)

from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "user_name",
            "order_id",
            "hyperpay_checkout_id",
            "hyperpay_transaction_id",
            "amount",
            "currency",
            "status",
            "created_at",
            "updated_at",
        ]

# payments/views.py
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import uuid
import requests
import uuid
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import redirect


class CreateCheckoutView(APIView):
    permission_classes = []  # AllowAny لتجربة عامة

    def post(self, request):
        body = request.data
        amount = body.get("amount")
        currency = body.get("currency", "SAR")
        customer_email = body.get("customer_email", "test@example.com")
        billing = body.get("billing", {})
        given_name = body.get("customer_givenName", "Test")
        surname = body.get("customer_surname", "User")
        merchant_txn = str(uuid.uuid4())

        if not amount:
            return Response({"error": "amount required"}, status=status.HTTP_400_BAD_REQUEST)

        url = f"{settings.HYPERPAY_BASE_URL.rstrip('/')}/v1/checkouts"

        headers = {
            "Authorization": f"Bearer {settings.HYPERPAY_ACCESS_TOKEN}",
            "Content-Type": "application/x-www-form-urlencoded"
        }

        data = {
            "entityId": settings.HYPERPAY_ENTITY_ID,
            "amount": str(amount),
            "currency": currency,
            "paymentType": "DB",

            # ✅ استخدم INTERNAL بدل EXTERNAL
            "testMode": "INTERNAL",

            # بيانات العميل والفاتورة
            "merchantTransactionId": merchant_txn,
            "customer.email": customer_email,
            "customer.givenName": given_name,
            "customer.surname": surname,
            "billing.street1": billing.get("street1", "Street 1"),
            "billing.city": billing.get("city", "Riyadh"),
            "billing.state": billing.get("state", "Riyadh"),
            "billing.country": billing.get("country", "SA"),
            "billing.postcode": billing.get("postcode", "12345"),
        }

        try:
            resp = requests.post(url, data=data, headers=headers, timeout=30)
            result = resp.json()
        except Exception as e:
            return Response({"error": "Failed to contact HyperPay", "detail": str(e)}, status=502)

        checkout_id = result.get("id") or result.get("checkoutId")
        return Response({
            "raw": result,
            "checkout_id": checkout_id,
            "script_url": f"{settings.HYPERPAY_BASE_URL.rstrip('/')}/v1/paymentWidgets.js?checkoutId={checkout_id}"
        }, status=resp.status_code)


class PaymentResultView(APIView):
    permission_classes = []

    def get(self, request):
        resource_path = request.query_params.get("resourcePath")
        if not resource_path:
            return Response({"error": "Missing resourcePath"}, status=400)

        url = f"{settings.HYPERPAY_BASE_URL.rstrip('/')}{resource_path}?entityId={settings.HYPERPAY_ENTITY_ID}"
        headers = {"Authorization": f"Bearer {settings.HYPERPAY_ACCESS_TOKEN}"}

        resp = requests.get(url, headers=headers)
        result = resp.json()
        code = result.get("result", {}).get("code", "")
        desc = result.get("result", {}).get("description", "")

        # ✅ نتائج النجاح والفشل
        if code.startswith("000.000") or code.startswith("000.100.1"):
            return redirect(f"http://localhost:5173/payment-success?status=success&code={code}")
        else:
            return redirect(f"http://localhost:5173/payment-failed?status=failed&code={code}")

class PaymentResultView(APIView):
    permission_classes = []

    def get(self, request):
        resource_path = request.query_params.get("resourcePath")
        if not resource_path:
            return Response({"error": "Missing resourcePath"}, status=400)

        # ✅ نضيف entityId هنا ضمن الرابط
        url = f"{settings.HYPERPAY_BASE_URL.rstrip('/')}{resource_path}?entityId={settings.HYPERPAY_ENTITY_ID}"

        headers = {
            "Authorization": f"Bearer {settings.HYPERPAY_ACCESS_TOKEN}"
        }

        try:
            resp = requests.get(url, headers=headers, timeout=30)
            data = resp.json()
        except Exception as e:
            return Response({"error": "Failed to fetch payment result", "detail": str(e)}, status=502)

        result = data.get("result", {})
        code = result.get("code", "")
        description = result.get("description", "")

        # ✅ لو الكود يبدأ بـ "000." فهي عملية ناجحة
        if code.startswith("000."):
            return redirect(f"http://localhost:5173/payment-success?status=success&code={code}")
        else:
            return redirect(f"http://localhost:5173/payment-failed?status=failed&code={code}&desc={description}")
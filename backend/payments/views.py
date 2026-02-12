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
# payments/views.py

# payments/views.py
import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Payment

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateStripePaymentIntent(APIView):
    permission_classes = []  # AllowAny مؤقتًا، يمكن لاحقًا Add IsAuthenticated

    def post(self, request):
        raw_amount = request.data.get("amount")
        if raw_amount is None:
            return Response({"error": "amount is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # تحويل ريال → هللات
            amount = int(float(raw_amount) * 100)
            if amount <= 0:
                raise ValueError
        except ValueError:
            return Response({"error": "invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # إنشاء Stripe PaymentIntent
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=settings.STRIPE_CURRENCY,
                automatic_payment_methods={"enabled": True},
            )

            # حفظ الدفع في DB
            Payment.objects.create(
                stripe_payment_intent=payment_intent.id,
                amount=float(raw_amount),
                currency=settings.STRIPE_CURRENCY,
                status=payment_intent.status,
                raw_response=payment_intent
            )

            return Response({"client_secret": payment_intent.client_secret}, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            return Response({"error": e.user_message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Payment

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateStripePaymentIntent(APIView):
    permission_classes = []  # AllowAny

    def post(self, request):
        try:
            amount = request.data.get("amount")

            if not amount:
                return Response(
                    {"error": "amount is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # تحويل المبلغ إلى هللات (Stripe يستخدم أصغر وحدة)
            amount_in_halalas = int(float(amount) * 100)

            payment_intent = stripe.PaymentIntent.create(
                amount=amount_in_halalas,
                currency=settings.STRIPE_CURRENCY,
                automatic_payment_methods={"enabled": True},
            )

            # إنشاء سجل الدفع في قاعدة البيانات
            Payment.objects.create(
                stripe_payment_intent_id=payment_intent.id,
                amount=amount,
                currency=settings.STRIPE_CURRENCY,
                status=Payment.STATUS_PENDING,
                raw_response=payment_intent
            )

            return Response(
                {
                    "client_secret": payment_intent.client_secret
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


import json
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from rest_framework.views import APIView
from .models import Payment
from salon.utils import send_whatsapp_message  # استدعاء الدالة
import stripe
from django.conf import settings

@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    permission_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        try:
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception:
            return HttpResponse(status=400)

        event_type = event["type"]
        intent = event["data"]["object"]

        payment = Payment.objects.filter(
            stripe_payment_intent_id=intent["id"]
        ).first()

        if not payment:
            return HttpResponse(status=200)

        if event_type == "payment_intent.succeeded":
            payment.status = Payment.STATUS_PAID
            payment.stripe_charge_id = intent.get("latest_charge")
            payment.raw_response = intent
            payment.save()

            # 🔹 إرسال رسالة WhatsApp تلقائية
            if payment.user:
                send_whatsapp_message(
                    phone=payment.user.username,  # الرقم المخزن عندك
                    code=f"تم استلام طلبك بنجاح! المبلغ: {payment.amount} {payment.currency} 💇‍♀️"
                )

        elif event_type == "payment_intent.payment_failed":
            payment.status = Payment.STATUS_FAILED
            payment.raw_response = intent
            payment.save()

        return HttpResponse(status=200)


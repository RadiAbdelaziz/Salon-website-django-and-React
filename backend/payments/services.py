import requests
from django.conf import settings

def create_checkout(amount, currency, customer_email):
    url = f"{settings.HYPERPAY_BASE_URL}/v1/checkouts"
    headers = {
        "Authorization": f"Bearer {settings.HYPERPAY_ACCESS_CODE}"
    }
    data = {
        "entityId": settings.HYPERPAY_ENTITY_ID,
        "amount": amount,
        "currency": currency,
        "paymentType": "DB",  # Debit
        "customer.email": customer_email,
    }

    response = requests.post(url, data=data, headers=headers)
    return response.json()

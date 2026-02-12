import random
from django.conf import settings
from twilio.rest import Client

def generate_otp():
    return str(random.randint(1000, 9999))
def send_whatsapp_message(phone, code):
    print(f"[OTP] {phone} => {code}")

    client = Client(
        settings.TWILIO_ACCOUNT_SID,
        settings.TWILIO_AUTH_TOKEN
    )

    message = client.messages.create(
        from_=f"whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}",
        to=f"whatsapp:{phone}",
        body=f"رمز التحقق الخاص بك هو {code} (صالح لمدة 5 دقائق)"
    )

    print("✅ SENT SID:", message.sid)
from twilio.rest import Client
from django.conf import settings
import time

def send_whatsapp_message(to_number: str, message: str):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    msg = client.messages.create(
        from_=f"whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}",
        to=f"whatsapp:{to_number}",
        body=message
    )

    print("✅ Sent SID:", msg.sid)

    # انتظر شوي ثم اجلب الحالة
    time.sleep(2)
    m = client.messages(msg.sid).fetch()
    print("📌 Status:", m.status)
    print("📌 ErrorCode:", m.error_code)
    print("📌 ErrorMessage:", m.error_message)

    return msg.sid

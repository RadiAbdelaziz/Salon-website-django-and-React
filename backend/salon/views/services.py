
from twilio.rest import Client
from django.conf import settings
# رجعه عندما تتوفر البيانات
# def send_whatsapp_message(to, otp):
#     client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
#     message = f"رمز التحقق الخاص بك هو: {otp}"
    
#     client.messages.create(
#         from_=settings.TWILIO_WHATSAPP_NUMBER,
#         body=message,
#         to=f'whatsapp:{to}'
#     )


## احذفه عندما تتوفر البيانات
def send_whatsapp_message(to, otp):
    """
    TEMP OTP SENDER (DEV ONLY)
    سيتم حذفه عند تفعيل Twilio
    """
    print("===================================")
    print("🚧 TEMP OTP MODE 🚧")
    print(f"Phone: {to}")
    print(f"OTP  : {otp}")
    print("===================================")


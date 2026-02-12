from django.urls import path
# from .views import hyperpay_webhook
from .views import  CreateCheckoutView , PaymentResultView , CreateStripePaymentIntent  , StripeWebhookView 
# 
urlpatterns = [
    path('create-checkout/', CreateCheckoutView.as_view(), name='create-checkout'),
    path("stripe/create-payment-intent/", CreateStripePaymentIntent.as_view()),
    path('result/', PaymentResultView.as_view(), name='payment-result') ,
    path("stripe/webhook/", StripeWebhookView.as_view(), name="stripe-webhook")
    


]

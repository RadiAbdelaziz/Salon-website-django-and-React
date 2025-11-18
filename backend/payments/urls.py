from django.urls import path
# from .views import hyperpay_webhook
from .views import  CreateCheckoutView , PaymentResultView
urlpatterns = [
    path('create-checkout/', CreateCheckoutView.as_view(), name='create-checkout'),
    path('result/', PaymentResultView.as_view(), name='payment-result')

]

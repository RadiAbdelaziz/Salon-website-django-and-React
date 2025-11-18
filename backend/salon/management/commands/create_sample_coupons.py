from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from salon.models import Coupon


class Command(BaseCommand):
    help = 'Create sample coupons for testing'

    def handle(self, *args, **options):
        # Clear existing sample coupons (optional)
        Coupon.objects.filter(code__in=['WELCOME10', 'SAVE50', 'NEWUSER20', 'SUMMER15']).delete()
        
        # Sample coupons
        coupons_data = [
            {
                'code': 'WELCOME10',
                'name': 'Welcome 10% Off',
                'description': '10% discount for new customers',
                'discount_type': 'percentage',
                'discount_value': 10.00,
                'minimum_amount': 100.00,
                'maximum_discount': 100.00,
                'usage_limit': 100,
                'valid_from': timezone.now(),
                'valid_until': timezone.now() + timedelta(days=365),
                'is_active': True
            },
            {
                'code': 'SAVE50',
                'name': 'Save 50 SAR',
                'description': '50 SAR off any service',
                'discount_type': 'fixed',
                'discount_value': 50.00,
                'minimum_amount': 200.00,
                'usage_limit': 50,
                'valid_from': timezone.now(),
                'valid_until': timezone.now() + timedelta(days=180),
                'is_active': True
            },
            {
                'code': 'NEWUSER20',
                'name': 'New User 20%',
                'description': '20% discount for new users',
                'discount_type': 'percentage',
                'discount_value': 20.00,
                'minimum_amount': 150.00,
                'maximum_discount': 200.00,
                'usage_limit': 200,
                'valid_from': timezone.now(),
                'valid_until': timezone.now() + timedelta(days=90),
                'is_active': True
            },
            {
                'code': 'SUMMER15',
                'name': 'Summer 15%',
                'description': '15% summer discount on all services',
                'discount_type': 'percentage',
                'discount_value': 15.00,
                'minimum_amount': 300.00,
                'maximum_discount': 150.00,
                'usage_limit': 500,
                'valid_from': timezone.now(),
                'valid_until': timezone.now() + timedelta(days=60),
                'is_active': True
            }
        ]
        
        created_coupons = []
        
        for coupon_data in coupons_data:
            coupon, created = Coupon.objects.get_or_create(
                code=coupon_data['code'],
                defaults=coupon_data
            )
            
            if created:
                created_coupons.append(coupon)
                self.stdout.write(
                    self.style.SUCCESS(f'Created coupon: {coupon.code} - {coupon.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Coupon already exists: {coupon.code}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(created_coupons)} sample coupons!')
        )
        self.stdout.write('You can now test these coupons in the booking form:')
        for coupon in created_coupons:
            self.stdout.write(f'  - {coupon.code}: {coupon.name}')
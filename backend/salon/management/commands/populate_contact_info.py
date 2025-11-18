from django.core.management.base import BaseCommand
from salon.models import ContactInfo


class Command(BaseCommand):
    help = 'Populate initial contact information'

    def handle(self, *args, **options):
        self.stdout.write("=== Adding Contact Information ===")
        
        # Check if contact info already exists
        existing_contact = ContactInfo.objects.filter(is_active=True).first()
        
        if existing_contact:
            self.stdout.write(f"[INFO] Contact info already exists: {existing_contact.phone_number}")
            self.stdout.write(f"Location: Riyadh, Saudi Arabia")
            self.stdout.write(f"Working Hours: Sunday - Thursday: 10 AM - 8 PM")
        else:
            # Create new contact info
            contact_info = ContactInfo.objects.create(
                phone_number="+966 55 123 4567",
                phone_number_en="+966 55 123 4567",
                location="الرياض، المملكة العربية السعودية",
                location_en="Riyadh, Kingdom of Saudi Arabia",
                working_hours="الأحد - الخميس: 10ص - 8م",
                working_hours_en="Sunday - Thursday: 10 AM - 8 PM",
                is_active=True
            )
            
            self.stdout.write(f"[SUCCESS] Created contact info: {contact_info.phone_number}")
            self.stdout.write(f"Location: Riyadh, Saudi Arabia")
            self.stdout.write(f"Working Hours: Sunday - Thursday: 10 AM - 8 PM")
        
        self.stdout.write(f"\n=== Summary ===")
        self.stdout.write(f"Total contact info records: {ContactInfo.objects.count()}")
        self.stdout.write(f"Active contact info: {ContactInfo.objects.filter(is_active=True).count()}")
        
        self.stdout.write(f"\n=== Test API Endpoint ===")
        self.stdout.write(f"API URL: http://127.0.0.1:8000/api/contact-info/")
        self.stdout.write(f"Admin URL: http://127.0.0.1:8000/admin/salon/contactinfo/")
        
        self.stdout.write(f"\n=== Test Complete ===")

from django.core.management.base import BaseCommand
from salon.models import Category


class Command(BaseCommand):
    help = 'Set default colors for existing categories'

    def handle(self, *args, **options):
        # Define color mappings for different categories
        color_mappings = {
            'hair': '#B89F67',  # Gold for hair care
            'makeup': '#E91E63',  # Pink for makeup
            'skincare': '#4CAF50',  # Green for skincare
            'nails': '#9C27B0',  # Purple for nails
            'massage': '#FF9800',  # Orange for massage
            'spa': '#00BCD4',  # Cyan for spa
            'facial': '#795548',  # Brown for facial
            'eyebrow': '#607D8B',  # Blue-grey for eyebrow
            'laser': '#F44336',  # Red for laser
        }

        updated_count = 0
        
        for category in Category.objects.all():
            # Try to match category name to color
            category_name_lower = category.name.lower()
            category_name_en_lower = category.name_en.lower() if category.name_en else ''
            
            # Find matching color
            selected_color = None
            for keyword, color in color_mappings.items():
                if (keyword in category_name_lower or 
                    keyword in category_name_en_lower or
                    keyword in category.description.lower() if category.description else False):
                    selected_color = color
                    break
            
            # If no match found, use default gold
            if not selected_color:
                selected_color = '#B89F67'
            
            # Update the category
            category.primary_color = selected_color
            category.save()
            updated_count += 1
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Updated category with color {selected_color}'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated {updated_count} categories with colors'
            )
        )

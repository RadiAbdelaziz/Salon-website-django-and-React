from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('salon', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='is_phone_verified',
            field=models.BooleanField(default=False, verbose_name='تم التحقق من الهاتف'),
        ),
    ]

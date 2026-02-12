from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('salon', '0003_phoneotp'),  # استبدل باسم آخر migration صحيح إذا اختلف
    ]

    operations = [
        migrations.AddField(
            model_name='phoneotp',
            name='is_used',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='phoneotp',
            name='attempts',
            field=models.PositiveIntegerField(default=0),
        ),
    ]

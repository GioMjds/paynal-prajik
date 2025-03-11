# Generated by Django 5.1.7 on 2025-03-11 02:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_roles', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customusers',
            name='age',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='customusers',
            name='guest_type',
            field=models.CharField(default='regular', max_length=200),
        ),
    ]

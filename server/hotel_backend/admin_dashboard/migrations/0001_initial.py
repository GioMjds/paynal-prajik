# Generated by Django 5.1.3 on 2025-03-27 11:56

import cloudinary.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AdminDetails',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('profile_pic', cloudinary.models.CloudinaryField(max_length=255, verbose_name='profile_pic')),
            ],
            options={
                'db_table': 'admin_details',
            },
        ),
    ]

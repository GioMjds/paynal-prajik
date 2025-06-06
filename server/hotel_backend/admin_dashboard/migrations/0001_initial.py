# Generated by Django 5.1.8 on 2025-05-01 13:50

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
        migrations.CreateModel(
            name='ArchivedUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_id', models.IntegerField()),
                ('email', models.EmailField(max_length=254)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('role', models.CharField(max_length=50)),
                ('archived_at', models.DateTimeField(auto_now_add=True)),
                ('archived_by', models.IntegerField(blank=True, null=True)),
            ],
            options={
                'db_table': 'archived_users',
            },
        ),
    ]

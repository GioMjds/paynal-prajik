# Generated by Django 5.2.3 on 2025-07-15 11:55

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_dashboard', '0001_initial'),
        ('property', '0002_roomimages'),
    ]

    operations = [
        migrations.CreateModel(
            name='Commissions',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('craveon_order_id', models.IntegerField()),
                ('booking_id', models.IntegerField(blank=True, null=True)),
                ('guest_name', models.CharField(blank=True, max_length=200, null=True)),
                ('guest_email', models.EmailField(blank=True, max_length=254, null=True)),
                ('total_order_value', models.DecimalField(decimal_places=2, max_digits=10)),
                ('commission_rate', models.DecimalField(decimal_places=2, default=10.0, max_digits=5)),
                ('commission_amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('order_status', models.CharField(choices=[('Pending', 'Pending'), ('Processing', 'Processing'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled'), ('Reviewed', 'Reviewed')], default='Pending', max_length=20)),
                ('ordered_at', models.DateTimeField()),
                ('commission_recorded_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_paid', models.BooleanField(default=False)),
                ('notes', models.TextField(blank=True, null=True)),
                ('area', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='commissions', to='property.areas')),
                ('room', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='commissions', to='property.rooms')),
            ],
            options={
                'db_table': 'commissions',
                'ordering': ['-ordered_at'],
            },
        ),
    ]

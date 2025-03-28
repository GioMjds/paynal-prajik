# Generated by Django 5.1.7 on 2025-03-28 12:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0002_bookings_end_time_bookings_payment_status_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bookings',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('reserved', 'Reserved'), ('confirmed', 'Confirmed'), ('checked_in', 'Checked In'), ('checked_out', 'Checked Out'), ('cancelled', 'Cancelled'), ('rejected', 'Rejected'), ('missed_reservation', 'Missed Reservation')], default='pending', max_length=20),
        ),
    ]

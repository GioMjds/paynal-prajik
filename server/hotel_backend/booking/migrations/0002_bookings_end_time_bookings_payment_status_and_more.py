# Generated by Django 5.1.7 on 2025-03-28 01:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='bookings',
            name='end_time',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='bookings',
            name='payment_status',
            field=models.CharField(default='unpaid', max_length=20),
        ),
        migrations.AddField(
            model_name='bookings',
            name='start_time',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='bookings',
            name='cancellation_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='bookings',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('reserved', 'Reserved'), ('confirmed', 'Confirmed'), ('checked_in', 'Checked In'), ('checked_out', 'Checked Out'), ('cancelled', 'Cancelled'), ('rejected', 'Rejected'), ('no_show', 'No Show')], default='pending', max_length=20),
        ),
    ]

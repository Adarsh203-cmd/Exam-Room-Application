# Generated by Django 5.2 on 2025-04-30 06:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exam_allotment', '0009_remove_examassignment_schedule_datetime'),
    ]

    operations = [
        migrations.AddField(
            model_name='examassignment',
            name='exam_end_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='examassignment',
            name='exam_start_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

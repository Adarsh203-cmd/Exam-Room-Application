# Generated by Django 5.2 on 2025-04-25 09:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('exam_content', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='exam_enrollment',
            fields=[
                ('enrollment_id', models.AutoField(primary_key=True, serialize=False)),
                ('full_name', models.CharField(max_length=150)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('department', models.CharField(blank=True, max_length=100, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'exam_enrollment',
            },
        ),
        migrations.CreateModel(
            name='exam_creation',
            fields=[
                ('exam_id', models.CharField(max_length=50, primary_key=True, serialize=False)),
                ('exam_title', models.CharField(max_length=255)),
                ('exam_start_time', models.DateTimeField()),
                ('exam_end_time', models.DateTimeField()),
                ('created_by', models.IntegerField()),
                ('role_or_department', models.CharField(max_length=100)),
                ('exam_url', models.CharField(max_length=500)),
                ('exam_token', models.CharField(max_length=100)),
                ('syllabus_topic', models.CharField(blank=True, max_length=100, null=True)),
                ('number_of_questions', models.IntegerField(blank=True, null=True)),
                ('marks_per_question', models.FloatField(blank=True, null=True)),
                ('total_marks', models.FloatField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('fib_question', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='exam_content.fillintheblankquestion')),
                ('mcq_question', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='exam_content.mcqquestion')),
            ],
            options={
                'db_table': 'exam_creation',
            },
        ),
        migrations.CreateModel(
            name='CandidateExamAssignment',
            fields=[
                ('assignment_id', models.AutoField(primary_key=True, serialize=False)),
                ('url_link', models.CharField(max_length=500)),
                ('schedule_datetime', models.DateTimeField()),
                ('invitation_sent_flag', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('exam', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exam_allotment.exam_creation')),
                ('enrollment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exam_allotment.exam_enrollment')),
            ],
            options={
                'db_table': 'candidate_exam_assignment',
            },
        ),
    ]

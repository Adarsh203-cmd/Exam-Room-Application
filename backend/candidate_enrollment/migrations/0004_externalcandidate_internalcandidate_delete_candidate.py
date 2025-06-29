# Generated by Django 5.2 on 2025-04-10 06:39

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("candidate_enrollment", "0003_candidate_email"),
    ]

    operations = [
        migrations.CreateModel(
            name="ExternalCandidate",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("first_name", models.CharField(max_length=50)),
                ("last_name", models.CharField(max_length=50)),
                ("gender", models.CharField(max_length=10)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("phone_number", models.CharField(max_length=15)),
                ("registered_on", models.DateTimeField(auto_now_add=True)),
                ("user_id", models.CharField(max_length=20, unique=True)),
                ("password", models.CharField(max_length=128)),
                ("dob", models.DateField(blank=True, null=True)),
                ("address", models.TextField(blank=True, null=True)),
                ("pin_code", models.CharField(blank=True, max_length=10, null=True)),
                ("city", models.CharField(blank=True, max_length=50, null=True)),
                (
                    "aadhar_number",
                    models.CharField(blank=True, max_length=20, null=True),
                ),
                (
                    "highest_qualification",
                    models.CharField(blank=True, max_length=100, null=True),
                ),
                (
                    "unique_id_proof",
                    models.CharField(blank=True, max_length=100, null=True),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="InternalCandidate",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("first_name", models.CharField(max_length=50)),
                ("last_name", models.CharField(max_length=50)),
                ("gender", models.CharField(max_length=10)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("phone_number", models.CharField(max_length=15)),
                ("registered_on", models.DateTimeField(auto_now_add=True)),
                ("employee_id", models.CharField(max_length=50, unique=True)),
                ("designation", models.CharField(max_length=50)),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.DeleteModel(
            name="Candidate",
        ),
    ]

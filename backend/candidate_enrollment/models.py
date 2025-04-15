from django.db import models
import uuid

# Base model for all candidates
class BaseCandidate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15)

    registered_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


# Model for Internal Candidates
class InternalCandidate(BaseCandidate):
    user_id = models.CharField(max_length=20, unique=True)
    password = models.CharField(max_length=128)
    employee_id = models.CharField(max_length=50, unique=True)
    designation = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.first_name} {self.last_name} (Internal)"


# Model for External Candidates
class ExternalCandidate(BaseCandidate):
    user_id = models.CharField(max_length=20, unique=True)
    password = models.CharField(max_length=128)

    dob = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    pin_code = models.CharField(max_length=10, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    aadhar_number = models.CharField(max_length=20, blank=True, null=True)
    highest_qualification = models.CharField(max_length=100, blank=True, null=True)
    unique_id_proof = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} (External)"

# backend/exam_allotment/models.py

from django.db import models
import uuid
from django.core.exceptions import ValidationError
from exam_content.models import MCQQuestion, FillInTheBlankQuestion
from candidate_enrollment.models import InternalCandidate, ExternalCandidate

class exam_creation(models.Model):
    id = models.AutoField(primary_key=True)
    exam_uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    exam_title = models.CharField(max_length=255)
    instruction = models.TextField(blank=True)

    exam_start_time = models.DateTimeField()
    exam_end_time = models.DateTimeField()
    created_by = models.IntegerField()
    role_or_department = models.CharField(max_length=100)
    candidate_type = models.IntegerField(choices=[(1, 'Internal'), (2, 'External')], default=1) #added this
    location = models.CharField(max_length=255, blank=True, null=True)
    mcq_question_ids = models.JSONField(default=list, blank=True)
    fib_question_ids = models.JSONField(default=list, blank=True)

    syllabus_topic = models.CharField(max_length=100, blank=True, null=True)
    number_of_questions = models.IntegerField(blank=True, null=True)
    marks_per_question = models.FloatField(blank=True, null=True)
    total_marks = models.FloatField(blank=True, null=True)

    exam_url = models.CharField(max_length=500)
    exam_token = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exam_creation'

    def save(self, *args, **kwargs):
        if self.number_of_questions is not None and self.marks_per_question is not None:
            self.total_marks = self.number_of_questions * self.marks_per_question
        super().save(*args, **kwargs)


class ExamAssignment(models.Model):
    assignment_id = models.AutoField(primary_key=True)
    exam = models.ForeignKey(exam_creation, on_delete=models.CASCADE)
    internal_candidate = models.ForeignKey(InternalCandidate, on_delete=models.CASCADE, null=True, blank=True)
    external_candidate = models.ForeignKey(ExternalCandidate, on_delete=models.CASCADE, null=True, blank=True)

    user_id = models.CharField(max_length=20)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField()

    password = models.CharField(max_length=128)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)

    location = models.CharField(max_length=255, blank=True, null=True)
    url_link = models.CharField(max_length=500)

    # real columns—will be populated from the view
    exam_start_time = models.DateTimeField(null=True, blank=True)
    exam_end_time   = models.DateTimeField(null=True, blank=True)

    invitation_sent_flag = models.BooleanField(default=False)
    exam_token = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exam_assignment'

    def clean(self):
        if not (self.internal_candidate or self.external_candidate):
            raise ValidationError('Either internal_candidate or external_candidate must be set.')
        if self.internal_candidate and self.external_candidate:
            raise ValidationError('Only one of internal_candidate or external_candidate may be set.')

    def save(self, *args, **kwargs):
        # If exam FK not set, but exam_token is provided, look up and assign it
        if not self.exam_id and self.exam_token:
            try:
                self.exam = exam_creation.objects.get(exam_token=self.exam_token)
            except exam_creation.DoesNotExist:
                pass

        # Populate candidate snapshot
        if self.internal_candidate:
            self.user_id    = self.internal_candidate.user_id
            self.first_name = self.internal_candidate.first_name
            self.last_name  = self.internal_candidate.last_name
            self.email      = self.internal_candidate.email
            # you may choose to snapshot password or not
            self.password   = self.internal_candidate.password
        elif self.external_candidate:
            self.user_id    = self.external_candidate.user_id
            self.first_name = self.external_candidate.first_name
            self.last_name  = self.external_candidate.last_name
            self.email      = self.external_candidate.email
            self.password   = self.external_candidate.password
        else:
            raise ValueError('Either internal_candidate or external_candidate must be set.')

        # Always pull latest location from exam
        if self.exam and self.exam.location:
            self.location = self.exam.location

        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def current_password(self):
        """
        Always return the candidate’s up-to-date password
        from the related candidate record.
        """
        if self.internal_candidate:
            return self.internal_candidate.password
        if self.external_candidate:
            return self.external_candidate.password
        return None

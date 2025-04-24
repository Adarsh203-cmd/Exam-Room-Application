from django.db import models
from exam_content.models import MCQQuestion, FillInTheBlankQuestion

# ENUM choices
PURPOSE_CHOICES = [('External', 'External'), ('Internal', 'Internal')]
CREATED_METHOD_CHOICES = [('Admin-Created', 'Admin-Created'), ('Self-Scheduled', 'Self-Scheduled')]
USER_TYPE_CHOICES = [('Candidate', 'Candidate'), ('Employee', 'Employee')]

class exam_creation(models.Model):
    exam_id = models.CharField(max_length=50, primary_key=True)
    exam_title = models.CharField(max_length=255)
    exam_purpose_type = models.CharField(max_length=10, choices=PURPOSE_CHOICES)
    evaluation_objective = models.CharField(max_length=255)
    exam_start_time = models.DateTimeField()
    exam_end_time = models.DateTimeField()
    created_by = models.IntegerField()
    created_method = models.CharField(max_length=20, choices=CREATED_METHOD_CHOICES)
    role_or_department = models.CharField(max_length=100)
    exam_url = models.CharField(max_length=500)
    exam_token = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'exam_creation'

class exam_enrollment(models.Model):
    enrollment_id = models.AutoField(primary_key=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exam_enrollment'

class CandidateExamAssignment(models.Model):
    assignment_id = models.AutoField(primary_key=True)
    exam = models.ForeignKey(exam_creation, on_delete=models.CASCADE)
    enrollment = models.ForeignKey(exam_enrollment, on_delete=models.CASCADE)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    url_link = models.CharField(max_length=500)
    schedule_datetime = models.DateTimeField()
    invitation_sent_flag = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'candidate_exam_assignment'

class ExamSyllabusAndQuestion(models.Model):
    allocation_id = models.AutoField(primary_key=True)
    exam = models.ForeignKey(exam_creation, on_delete=models.CASCADE)
    syllabus_topic = models.CharField(max_length=100)
    number_of_questions = models.IntegerField(blank=True, null=True)
    marks_per_question = models.FloatField(blank=True, null=True)
    total_marks = models.FloatField(blank=True, null=True)
    mcq_question = models.ForeignKey(MCQQuestion, on_delete=models.SET_NULL, null=True, blank=True)
    fib_question = models.ForeignKey(FillInTheBlankQuestion, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exam_syllabus_and_question'

    def save(self, *args, **kwargs):
        if self.number_of_questions is not None and self.marks_per_question is not None:
            self.total_marks = self.number_of_questions * self.marks_per_question
        super().save(*args, **kwargs)


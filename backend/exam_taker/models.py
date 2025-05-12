from django.db import models
import uuid

# Create your models here.
class ExamAttempt(models.Model):
    attempt_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    assignment = models.ForeignKey('exam_allotment.ExamAssignment', on_delete=models.CASCADE)
    exam = models.ForeignKey('exam_allotment.exam_creation', on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    is_submitted = models.BooleanField(default=False)
    duration_seconds = models.IntegerField(null=True, blank=True)  # for tracking exact duration used

    class Meta:
        ordering = ['-started_at']


#save responses for MCQ type
class MCQAnswer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE)
    question = models.ForeignKey('exam_content.MCQQuestion', on_delete=models.CASCADE)
    selected_options = models.JSONField()  # ["A", "C"], or ["4"]
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('attempt', 'question')

#save responses for fill in the blank type
class FIBAnswer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE)
    question = models.ForeignKey('exam_content.FillInTheBlankQuestion', on_delete=models.CASCADE)
    user_response = models.TextField()
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('attempt', 'question')

#Login attempts
class LoginAttempt(models.Model):
    assignment = models.ForeignKey('exam_allotment.ExamAssignment', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

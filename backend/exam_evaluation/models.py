# Create your models here.
from django.db import models
from exam_taker.models import ExamAttempt

class ExamResult(models.Model):
    """
    Stores the overall exam result for a candidate's attempt
    """
    result_id = models.AutoField(primary_key=True)
    attempt = models.OneToOneField(ExamAttempt, on_delete=models.CASCADE, related_name='result')
    total_marks_obtained = models.FloatField()
    total_marks_possible = models.FloatField()
    percentage_score = models.FloatField()
    is_passed = models.BooleanField(default=False)
    evaluated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'exam_result'
    
    def save(self, *args, **kwargs):
        # Calculate percentage score
        if self.total_marks_possible > 0:
            self.percentage_score = (self.total_marks_obtained / self.total_marks_possible) * 100
        else:
            self.percentage_score = 0
        
        # Default passing criteria (can be customized)
        self.is_passed = self.percentage_score >= 40  # Assuming 40% is pass
        
        super().save(*args, **kwargs)


class SubjectWiseResult(models.Model):
    """
    Stores subject-wise breakdown of scores for a candidate's attempt
    """
    subject_result_id = models.AutoField(primary_key=True)
    exam_result = models.ForeignKey(ExamResult, on_delete=models.CASCADE, related_name='subject_results')
    subject = models.CharField(max_length=100)
    marks_obtained = models.FloatField()
    total_marks = models.FloatField()
    percentage_score = models.FloatField()
    
    class Meta:
        db_table = 'subject_wise_result'
        unique_together = ('exam_result', 'subject')
    
    def save(self, *args, **kwargs):
        # Calculate percentage score
        if self.total_marks > 0:
            self.percentage_score = (self.marks_obtained / self.total_marks) * 100
        else:
            self.percentage_score = 0
        
        super().save(*args, **kwargs)


class QuestionResult(models.Model):
    """
    Stores evaluation result for each question in an attempt
    """
    question_result_id = models.AutoField(primary_key=True)
    exam_result = models.ForeignKey(ExamResult, on_delete=models.CASCADE, related_name='question_results')
    subject = models.CharField(max_length=100)
    question_type = models.CharField(max_length=10)  # 'MCQ' or 'FIB'
    question_id = models.IntegerField()
    marks_obtained = models.FloatField()
    total_marks = models.FloatField()
    is_correct = models.BooleanField()
    
    class Meta:
        db_table = 'question_result'
        unique_together = ('exam_result', 'question_type', 'question_id')
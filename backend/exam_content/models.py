from django.db import models
import uuid

# Create your models here.

class MCQQuestion(models.Model):
    ANSWER_TYPES = [
        ('Single', 'Single Correct'),
        ('Multiple', 'Multiple Correct'),
    ]
    DIFFICULTY_LEVELS = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    id = models.AutoField(primary_key=True)
    subject = models.CharField(max_length=100)
    question_text = models.TextField()
    options = models.JSONField(help_text="List of options like ['A', 'B', 'C', 'D']")
    answer_type = models.CharField(max_length=10, choices=ANSWER_TYPES)
    correct_answers = models.JSONField(help_text="List of correct answers like ['A'] or ['A', 'C']")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS)
    marks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'mcq_question'

    def __str__(self):
        return f"MCQ: {self.question_text[:50]}"


class FillInTheBlankQuestion(models.Model):
    DIFFICULTY_LEVELS = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    id = models.AutoField(primary_key=True)
    subject = models.CharField(max_length=100)
    question_text = models.TextField()
    correct_answers = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS)
    marks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fill_blank_question'

    def __str__(self):
        return f"Fill: {self.question_text[:50]}"

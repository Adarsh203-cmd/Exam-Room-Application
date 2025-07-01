#views.py
from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.db.models import Sum, F
from django.utils import timezone

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from exam_taker.models import ExamAttempt, MCQAnswer, FIBAnswer
from exam_content.models import MCQQuestion, FillInTheBlankQuestion
from exam_allotment.models import exam_creation, ExamAssignment
from .models import ExamResult, SubjectWiseResult, QuestionResult
from django.db.models import Avg, Max
import json
from collections import defaultdict
from .models import ElogixaHiringTestData
from datetime import datetime


@api_view(['POST'])
def evaluate_exam(request, attempt_id):
    """
    Evaluate an exam attempt and generate results
    """
    try:
        # Get the exam attempt
        attempt = get_object_or_404(ExamAttempt, attempt_id=attempt_id)
        
        # If already submitted and evaluated, return existing result
        if attempt.is_submitted and hasattr(attempt, 'result'):
            return Response({
                'message': 'Exam already evaluated',
                'result_id': attempt.result.result_id
            }, status=status.HTTP_200_OK)
        
        # Mark as submitted if not already
        if not attempt.is_submitted:
            attempt.is_submitted = True
            attempt.ended_at = timezone.now()
            
            # Calculate duration in seconds if started_at exists
            if attempt.started_at:
                duration = (attempt.ended_at - attempt.started_at).total_seconds()
                attempt.duration_seconds = duration
                
            attempt.save()
        
        # Evaluate the exam
        with transaction.atomic():
            total_marks_obtained = 0
            total_marks_possible = 0
            subject_scores = defaultdict(lambda: {'obtained': 0, 'total': 0})
            
            # Create a new result record
            result, created = ExamResult.objects.update_or_create(
            attempt=attempt,
            defaults={
             'total_marks_obtained': 0,
            'total_marks_possible': 0
           }
           )
            
            # Evaluate MCQ answers
            mcq_answers = MCQAnswer.objects.filter(attempt=attempt).select_related('question')
            for answer in mcq_answers:
                question = answer.question
                marks = question.marks
                subject = question.subject
                total_marks_possible += marks
                subject_scores[subject]['total'] += marks
                
                # Check if answer is correct
                is_correct = False
                
                # For single correct answer
                if question.answer_type == 'Single':
                    is_correct = set(answer.selected_options) == set(question.correct_answers)
                # For multiple correct answers
                else:  # Multiple
                    # All selected options must be correct and all correct options must be selected
                    is_correct = set(answer.selected_options) == set(question.correct_answers)
                
                # Award marks if correct
                marks_obtained = marks if is_correct else 0
                total_marks_obtained += marks_obtained
                subject_scores[subject]['obtained'] += marks_obtained
                
                # Store question result
                QuestionResult.objects.update_or_create(
                    exam_result=result,
                    subject=subject,
                    question_type='MCQ',
                    question_id=question.id,
                    marks_obtained=marks_obtained,
                    total_marks=marks,
                    is_correct=is_correct
                )
            
            # Evaluate FIB answers
            fib_answers = FIBAnswer.objects.filter(attempt=attempt).select_related('question')
            for answer in fib_answers:
                question = answer.question
                marks = question.marks
                subject = question.subject
                total_marks_possible += marks
                subject_scores[subject]['total'] += marks
                
                # Simple exact match for FIB - can be enhanced for partial matching
                is_correct = answer.user_response.strip().lower() == question.correct_answers.strip().lower()
                
                # Award marks if correct
                marks_obtained = marks if is_correct else 0
                total_marks_obtained += marks_obtained
                subject_scores[subject]['obtained'] += marks_obtained
                
                # Store question result
                QuestionResult.objects.update_or_create(
                    exam_result=result,
                    subject=subject,
                    question_type='FIB',
                    question_id=question.id,
                    marks_obtained=marks_obtained,
                    total_marks=marks,
                    is_correct=is_correct
                )
            
            # Update total marks in result
            result.total_marks_obtained = total_marks_obtained
            result.total_marks_possible = total_marks_possible
            result.save()
            
            # Create subject-wise results
            for subject, scores in subject_scores.items():
                SubjectWiseResult.objects.update_or_create(
                    exam_result=result,
                    subject=subject,
                    marks_obtained=scores['obtained'],
                    total_marks=scores['total'],
                    percentage_score=(scores['obtained'] / scores['total'] * 100) if scores['total'] > 0 else 0
                )
        
        return Response({
            'message': 'Exam evaluated successfully',
            'result_id': result.result_id,
            'total_marks': total_marks_obtained,
            'total_possible': total_marks_possible,
            'percentage': result.percentage_score,
            'passed': result.is_passed
        }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_result(request, result_id):
    """
    Get detailed result for an exam
    """
    try:
        result = get_object_or_404(ExamResult, result_id=result_id)
        
        # Get subject-wise results
        subject_results = SubjectWiseResult.objects.filter(exam_result=result)
        
        # Format response
        response_data = {
            'result_id': result.result_id,
            'candidate_name': f"{result.attempt.assignment.first_name} {result.attempt.assignment.last_name}",
            'exam_title': result.attempt.exam.exam_title,
            'total_marks_obtained': result.total_marks_obtained,
            'total_marks_possible': result.total_marks_possible,
            'percentage_score': result.percentage_score,
            'is_passed': result.is_passed,
            'evaluated_at': result.evaluated_at,
            'subjects': [
                {
                    'subject': sr.subject,
                    'marks_obtained': sr.marks_obtained,
                    'total_marks': sr.total_marks,
                    'percentage': sr.percentage_score
                }
                for sr in subject_results
            ]
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_candidate_results(request, user_id):
    """
    Get all results for a specific candidate
    """
    try:
        # Find all assignments for this candidate
        assignments = ExamAssignment.objects.filter(user_id=user_id)
        
        # Get all attempts and their results
        results = []
        for assignment in assignments:
            attempts = ExamAttempt.objects.filter(assignment=assignment)
            for attempt in attempts:
                if hasattr(attempt, 'result'):
                    results.append({
                        'result_id': attempt.result.result_id,
                        'exam_title': attempt.exam.exam_title,
                        'attempt_date': attempt.started_at,
                        'total_marks': attempt.result.total_marks_obtained,
                        'percentage': attempt.result.percentage_score,
                        'passed': attempt.result.is_passed
                    })
        
        return Response(results, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_exam_statistics(request, exam_id):
    """
    Get statistics for a specific exam (all candidates)
    """
    try:
        exam = get_object_or_404(exam_creation, id=exam_id)
        
        # Get all attempts for this exam
        attempts = ExamAttempt.objects.filter(exam=exam, is_submitted=True)
        
        # Get all results
        results = ExamResult.objects.filter(attempt__in=attempts)
        
        if not results.exists():
            return Response({
                'error': 'No results found for this exam'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate statistics
        total_candidates = results.count()
        passed_candidates = results.filter(is_passed=True).count()
        
        # Average score
        avg_score = results.aggregate(avg=Sum('percentage_score') / total_candidates)['avg']
        
        # Get subject-wise statistics
        subjects = SubjectWiseResult.objects.filter(exam_result__in=results).values('subject').distinct()
        
        subject_stats = []
        for subject_data in subjects:
            subject = subject_data['subject']
            subject_results = SubjectWiseResult.objects.filter(
                exam_result__in=results,
                subject=subject
            )
            
            total_subject_results = subject_results.count()
            avg_subject_score = subject_results.aggregate(
                avg=Sum('percentage_score') / total_subject_results
            )['avg']
            
            subject_stats.append({
                'subject': subject,
                'average_score': avg_subject_score
            })
        
        response_data = {
            'exam_id': exam_id,
            'exam_title': exam.exam_title,
            'total_candidates': total_candidates,
            'passed_candidates': passed_candidates,
            'pass_percentage': (passed_candidates / total_candidates * 100) if total_candidates > 0 else 0,
            'average_score': avg_score,
            'subject_statistics': subject_stats
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_all_exam_attempts(request):
    """
    Get all submitted exam attempts
    """
    try:
        # Fetch all submitted exam attempts
        submitted_attempts = ExamAttempt.objects.filter(is_submitted=True).select_related('exam', 'assignment')
        
        exam_data = []
        for attempt in submitted_attempts:
            # Check if result exists for this attempt
            if hasattr(attempt, 'result'):
                result = attempt.result
                
                # Get subject-wise results
                subject_results = SubjectWiseResult.objects.filter(exam_result=result)
                
                # Create a candidate object with properly structured subject scores
                candidate = {
                    'name': f"{attempt.assignment.first_name} {attempt.assignment.last_name}",
                    'score': result.total_marks_obtained,
                    'percentage': result.percentage_score,
                    'passed': result.is_passed,
                    'subjectScores': {}  # This will hold all subject scores
                }
                
                # Add all subject scores to the subjectScores object
                for sr in subject_results:
                    candidate['subjectScores'][sr.subject] = sr.marks_obtained
                
                # For backward compatibility, also include individual subject properties
                for sr in subject_results:
                    # Convert subject name to lowercase for property names
                    subject_key = sr.subject.lower()
                    candidate[subject_key] = sr.marks_obtained
                
                exam_data.append({
                    'id': attempt.exam.id,
                    'name': attempt.exam.exam_title,
                    'date': attempt.ended_at,
                    'cutOff': 40,  # Default cut-off, adjust as needed
                    'candidates': [candidate]
                })
        
        return Response(exam_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_dashboard_stats(request):
    """
    Get overall dashboard statistics
    """
    try:
        # Get all exam results
        results = ExamResult.objects.all()
        
        # Calculate overall success rate
        total_results = results.count()
        passed_results = results.filter(is_passed=True).count()
        
        success_rate = (passed_results / total_results * 100) if total_results > 0 else 0
        
        # Count total and upcoming exams
        total_exams = exam_creation.objects.count()
        
        # For upcoming exams, you might want to define a specific criteria 
        # This is a placeholder - adjust based on your actual requirements
        upcoming_exams = exam_creation.objects.filter(
            created_at__gt=timezone.now()  # Exams created in the future
        ).count()
        
        return Response({
            'success_rate': round(success_rate, 2),
            'total_exams': total_exams,
            'upcoming_exams': upcoming_exams
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def all_exams(request):
    """
    Get all exams from exam_creation table
    """
    exams = exam_creation.objects.all()
    data = []
    
    for exam in exams:
        exam_data = {
            'id': exam.id,
            'name': exam.exam_title,  # Changed from exam.title to exam.exam_title
            'title': exam.exam_title,  # Added both fields for compatibility
            'date': exam.created_at,
            'exam_start_time': exam.exam_start_time,  # Use the field from the model
            'cutOff': getattr(exam, 'passing_marks_percentage', 40)  # Default to 40% if field doesn't exist
        }
        
        # Try to get exam start time from assignment if available
        try:
            assignment = ExamAssignment.objects.filter(exam=exam).first()
            if assignment:
                exam_data['exam_start_time'] = assignment.start_datetime
        except Exception as e:
            # Log error but continue (optional)
            print(f"Error fetching assignment for exam {exam.id}: {str(e)}")
        
        data.append(exam_data)
    
    return Response(data)

@api_view(['GET'])
def upcoming_exams(request):
    """
    Get upcoming exams based on exam_start_time from exam_assignment table.
    Each exam appears only once with a list of assigned candidates.
    """
    now = timezone.now()
    upcoming = []
    
    try:
        # Get all assignments with future start times
        assignments = ExamAssignment.objects.filter(exam_start_time__gt=now)
        
        # Group assignments by exam_id
        exam_dict = {}
        
        for assignment in assignments:
            exam = assignment.exam
            exam_id = exam.id
            
            # Prepare candidate info
            candidate = {
                'user_id': assignment.user_id,
                'name': f"{assignment.first_name} {assignment.last_name}",
                'email': assignment.email,
                'candidate_id': assignment.external_candidate_id or assignment.internal_candidate_id,
                'exam_token': assignment.exam_token,
            }
            
            # If this exam is already in our dictionary, just add the candidate
            if exam_id in exam_dict:
                exam_dict[exam_id]['candidates'].append(candidate)
            else:
                # Otherwise create a new entry for this exam
                exam_dict[exam_id] = {
                    'id': exam_id,
                    'name': exam.exam_title,
                    'title': exam.exam_title,
                    'date': exam.created_at,
                    'exam_start_time': assignment.exam_start_time,
                    'exam_token': assignment.exam_token,
                    'cutOff': getattr(exam, 'passing_marks_percentage', 40),
                    'candidates': [candidate]
                }
        
        # Convert dictionary to list for the response
        upcoming = list(exam_dict.values())
    
    except Exception as e:
        # Log the error and return an empty list
        print(f"Error fetching upcoming exams: {str(e)}")
    
    return Response(upcoming)


@api_view(['GET'])
def get_exam_details(request, exam_id):
    """
    Get detailed information about an exam including subject-wise statistics
    """
    try:
        exam = get_object_or_404(exam_creation, id=exam_id)
        
        # Get all attempts for this exam
        attempts = ExamAttempt.objects.filter(exam=exam, is_submitted=True)
        
        # Get all results
        results = ExamResult.objects.filter(attempt__in=attempts)
        
        if not results.exists():
            return Response({
                'error': 'No results found for this exam'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get all subjects for this exam
        subjects = SubjectWiseResult.objects.filter(
            exam_result__in=results
        ).values_list('subject', flat=True).distinct()
        
        # Calculate statistics for each subject
        subject_stats = []
        for subject in subjects:
            subject_results = SubjectWiseResult.objects.filter(
                exam_result__in=results,
                subject=subject
            )
            
            avg_score = subject_results.aggregate(
                avg=Avg('percentage_score')
            )['avg']
            
            highest_score = subject_results.aggregate(
                max=Max('percentage_score')
            )['max']
            
            subject_stats.append({
                'subject': subject,
                'average_score': avg_score,
                'highest_score': highest_score
            })
        
        # Get candidate data with proper subject scores
        candidates = []
        for result in results:
            # Get all subject scores for this candidate
            subject_scores = SubjectWiseResult.objects.filter(exam_result=result)
            
            # Create candidate object
            candidate = {
                'name': f"{result.attempt.assignment.first_name} {result.attempt.assignment.last_name}",
                'score': result.total_marks_obtained,
                'percentage': result.percentage_score,
                'passed': result.is_passed,
                'subjectScores': {}  # This will hold all subject scores
            }
            
            # Add all subject scores
            for ss in subject_scores:
                candidate['subjectScores'][ss.subject] = ss.marks_obtained
            
            candidates.append(candidate)
        
        response_data = {
            'exam_id': exam_id,
            'exam_title': exam.exam_title,
            'date': exam.created_at,
            'cutOff': getattr(exam, 'passing_marks_percentage', 40),  # Default to 40% if not set
            'subject_statistics': subject_stats,
            'candidates': candidates
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def elogixa_hiring_test_data(request):
    """
    API endpoint to fetch Elogixa hiring test data
    """
    try:
        # Fetch all records from the database
        test_data = ElogixaHiringTestData.objects.all().order_by('-test_date', '-id')
        
        # Format the data to match your frontend expectations
        formatted_data = []
        for record in test_data:
            formatted_data.append({
                'id': record.id,
                'name': record.candidate_name,
                'aptitude': record.aptitude,
                'technical': record.technical,
                'total_score': record.total_score,
                'test_date': record.test_date.strftime('%Y-%m-%d') if record.test_date else None,
                # Format to match your existing exam structure
                'candidates': [{
                    'name': record.candidate_name,
                    'score': record.total_score,
                    'aptitude': record.aptitude,
                    'technical': record.technical,
                    'reasoning': 0,  # Not available in this dataset
                    'networks': 0,   # Not available in this dataset
                }]
            })
        
        return Response({
            'success': True,
            'data': formatted_data,
            'count': len(formatted_data)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)
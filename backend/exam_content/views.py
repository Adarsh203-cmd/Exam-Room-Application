from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import MCQQuestion, FillInTheBlankQuestion
from .serializers import MCQQuestionSerializer, FillBlankQuestionSerializer
from django.shortcuts import get_object_or_404


# Create MCQ Question
class MCQQuestionCreateView(APIView):
    def post(self, request):
        serializer = MCQQuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "MCQ question created successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# List with search/filter
class MCQListView(APIView):
    def get(self, request):
        subject = request.query_params.get('subject')
        difficulty = request.query_params.get('difficulty')
        queryset = MCQQuestion.objects.all()

        if subject:
            queryset = queryset.filter(subject__icontains=subject)
        if difficulty:
            queryset = queryset.filter(difficulty__iexact=difficulty)

        serializer = MCQQuestionSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Update/Delete by ID
class MCQDetailView(APIView):
    def get_object(self, pk):
        return get_object_or_404(MCQQuestion, pk=pk)

    def put(self, request, pk):
        instance = self.get_object(pk)
        serializer = MCQQuestionSerializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "MCQ question updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        instance = self.get_object(pk)
        instance.delete()
        return Response({"message": "MCQ question deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    






# ============ Same for Fill-in-the-Blank ============

class FillBlankQuestionCreateView(APIView):
    def post(self, request):
        serializer = FillBlankQuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Fill-in-the-Blank question created successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FillBlankListView(APIView):
    def get(self, request):
        subject = request.query_params.get('subject')
        difficulty = request.query_params.get('difficulty')
        queryset = FillInTheBlankQuestion.objects.all()

        if subject:
            queryset = queryset.filter(subject__icontains=subject)
        if difficulty:
            queryset = queryset.filter(difficulty__iexact=difficulty)

        serializer = FillBlankQuestionSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FillBlankDetailView(APIView):
    def get_object(self, pk):
        return get_object_or_404(FillInTheBlankQuestion, pk=pk)

    def put(self, request, pk):
        instance = self.get_object(pk)
        serializer = FillBlankQuestionSerializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Fill-in-the-Blank question updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        instance = self.get_object(pk)
        instance.delete()
        return Response({"message": "Fill-in-the-Blank question deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

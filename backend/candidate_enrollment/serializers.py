from rest_framework import serializers
from .models import InternalCandidate, ExternalCandidate

class InternalCandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternalCandidate
        fields = '__all__'


class ExternalCandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalCandidate
        fields = '__all__'

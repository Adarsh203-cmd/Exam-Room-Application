import django_filters
from .models import InternalCandidate, ExternalCandidate  # Adjust the import if needed


#Filetring candidates based on their first_name, last_name, user_id
class CandidateFilter(django_filters.FilterSet):
    first_name = django_filters.CharFilter(field_name='first_name', lookup_expr='icontains')
    last_name = django_filters.CharFilter(field_name='last_name', lookup_expr='icontains')
    user_id = django_filters.CharFilter(field_name='user_id', lookup_expr='icontains')

    class Meta:
        model = InternalCandidate  # You can add ExternalCandidate as well if you want to filter both
        fields = ['first_name', 'last_name', 'user_id']
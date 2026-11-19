from django.urls import path
from .views import DocumentListCreateView, DocumentStatusUpdateView

urlpatterns = [
    path('', DocumentListCreateView.as_view(), name='document-list-create'),
    path('<int:pk>/status/', DocumentStatusUpdateView.as_view(), name='document-status-update'),
]

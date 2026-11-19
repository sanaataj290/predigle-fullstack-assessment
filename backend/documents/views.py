from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Document
from .serializers import (
    DocumentCreateSerializer,
    DocumentSerializer,
    DocumentStatusUpdateSerializer,
)


class DocumentListCreateView(APIView):
    """
    Handles listing existing document submissions (GET)
    and creating new document submissions (POST).
    """

    def get(self, request):
        """
        Retrieve all document submissions ordered newest first.
        Returns 200 OK with a JSON array of documents.
        """
        documents = Document.objects.all()
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Create a new document submission.
        Accepts title and optional description.
        Automatically sets status to 'pending'.
        Returns 201 Created on success, or 400 Bad Request on validation failure.
        """
        serializer = DocumentCreateSerializer(data=request.data)
        if serializer.is_valid():
            document = serializer.save()
            response_serializer = DocumentSerializer(document)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DocumentStatusUpdateView(APIView):
    """
    Handles reviewing and updating the status of a document (PATCH).
    """

    def patch(self, request, pk):
        """
        Update the status of a pending document to 'approved' or 'rejected'.
        Returns 200 OK on success.
        Returns 404 Not Found if document ID does not exist.
        Returns 400 Bad Request if status is invalid or document is not in pending status.
        """
        document = get_object_or_404(Document, pk=pk)
        serializer = DocumentStatusUpdateSerializer(
            instance=document,
            data=request.data
        )
        if serializer.is_valid():
            updated_document = serializer.save()
            response_serializer = DocumentSerializer(updated_document)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

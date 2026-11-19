from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for representing Document records.
    Returns all required fields: id, title, description, status, created_at.
    """

    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'status', 'created_at']
        read_only_fields = ['id', 'title', 'description', 'status', 'created_at']


class DocumentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new Document submissions.
    Enforces title validation and ensures initial status is always 'pending'.
    """

    title = serializers.CharField(max_length=255, required=True)
    description = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

    def validate_title(self, value):
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError('Title cannot be empty or contain only whitespace.')
        return trimmed

    def create(self, validated_data):
        # Enforce Rule 1 & Rule 8: Every new document starts as pending; client cannot assign status.
        validated_data['status'] = Document.Status.PENDING
        return super().create(validated_data)


class DocumentStatusUpdateSerializer(serializers.Serializer):
    """
    Serializer for reviewing and updating the status of a pending document.
    Accepts only 'approved' or 'rejected'.
    Enforces business rules preventing review of non-pending documents.
    """

    REVIEW_STATUS_CHOICES = [
        (Document.Status.APPROVED, 'Approved'),
        (Document.Status.REJECTED, 'Rejected'),
    ]

    status = serializers.ChoiceField(
        choices=REVIEW_STATUS_CHOICES,
        required=True,
        error_messages={
            'required': 'Status field is required.',
            'invalid_choice': "Invalid status. Permitted review values are 'approved' or 'rejected'."
        }
    )

    def validate(self, attrs):
        new_status = attrs.get('status')
        # Rule 2, 3, 4, 5: A document can be reviewed only when its current status is pending.
        if self.instance.status != Document.Status.PENDING:
            raise serializers.ValidationError({
                'status': (
                    f"Cannot change status to '{new_status}'. "
                    f"Only pending documents can be reviewed. "
                    f"This document is already {self.instance.status}."
                )
            })
        return attrs

    def update(self, instance, validated_data):
        instance.status = validated_data['status']
        instance.save(update_fields=['status'])
        return instance

from django.db import models


class Document(models.Model):
    """
    Model representing a document submission for review.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    title = models.CharField(
        max_length=255,
        help_text='Title of the submitted document.'
    )
    description = models.TextField(
        blank=True,
        default='',
        help_text='Optional description of the document submission.'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        help_text='Current review status of the document.'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Timestamp when the document submission was created.'
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'

    def __str__(self):
        return f'{self.title} ({self.status})'

import json
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Document


class MandatoryDocumentTests(TestCase):
    """
    Phase 2: The Four Mandatory Django Automated Tests required by the assessment.
    """

    def setUp(self):
        self.client = APIClient()
        self.list_create_url = reverse('document-list-create')

    # =========================================================================
    # TEST 1: Successful document submission
    # =========================================================================
    def test_01_successful_document_submission(self):
        """
        Verify:
        - A valid document can be created.
        - The API returns HTTP 201 Created.
        - The document is saved in the database.
        - The returned title and description are correct.
        - An ID is generated.
        - Initial status is Pending.
        - A creation timestamp is present.
        """
        payload = {
            'title': 'Medical Report 2026',
            'description': 'Comprehensive annual health assessment records.',
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')

        # 1. API returns HTTP 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()

        # 2. Document is saved in the database
        self.assertEqual(Document.objects.count(), 1)
        doc = Document.objects.get()

        # 3. An ID is generated
        self.assertIsNotNone(data.get('id'))
        self.assertEqual(data['id'], doc.id)

        # 4. Returned title and description are correct
        self.assertEqual(data['title'], payload['title'])
        self.assertEqual(data['description'], payload['description'])
        self.assertEqual(doc.title, payload['title'])
        self.assertEqual(doc.description, payload['description'])

        # 5. Initial status is Pending
        self.assertEqual(data['status'], Document.Status.PENDING)
        self.assertEqual(doc.status, Document.Status.PENDING)

        # 6. Creation timestamp is present
        self.assertIn('created_at', data)
        self.assertIsNotNone(data['created_at'])

    # =========================================================================
    # TEST 2: Reject an empty title
    # =========================================================================
    def test_02_reject_empty_title(self):
        """
        Verify:
        - A submission with an empty title is rejected.
        - The API returns HTTP 400 Bad Request.
        - A suitable validation error is returned.
        - No invalid document is saved.
        """
        payload = {
            'title': '',
            'description': 'Submission with empty title.',
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')

        # 1. API returns HTTP 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # 2. Suitable validation error returned
        data = response.json()
        self.assertIn('title', data)

        # 3. No invalid document is saved
        self.assertEqual(Document.objects.count(), 0)

    # =========================================================================
    # TEST 3: Retrieve submissions
    # =========================================================================
    def test_03_retrieve_submissions_and_empty_list(self):
        """
        Verify:
        - The GET endpoint returns HTTP 200 OK.
        - Empty list behavior returns [] when database has no submissions.
        - Response contains previously created submissions with expected JSON structure.
        - Returned document details are correct.
        """
        # A. Empty database test
        empty_response = self.client.get(self.list_create_url)
        self.assertEqual(empty_response.status_code, status.HTTP_200_OK)
        self.assertEqual(empty_response.json(), [])

        # B. Populate submissions
        doc1 = Document.objects.create(
            title='Project Proposal',
            description='Architecture proposal for review.'
        )
        doc2 = Document.objects.create(
            title='Financial Audit',
            description='Q3 Balance sheet.'
        )

        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        # Verify length and structure
        self.assertEqual(len(data), 2)
        expected_keys = {'id', 'title', 'description', 'status', 'created_at'}
        for item in data:
            self.assertTrue(expected_keys.issubset(item.keys()))

        # Verify documents appear with correct details (ordered newest first)
        returned_ids = [item['id'] for item in data]
        self.assertIn(doc1.id, returned_ids)
        self.assertIn(doc2.id, returned_ids)

    # =========================================================================
    # TEST 4: Update document status
    # =========================================================================
    def test_04_update_document_status(self):
        """
        Verify:
        - A pending document can be approved.
        - A pending document can be rejected.
        - The correct HTTP response is returned (HTTP 200 OK).
        - The database contains the updated status.
        - A subsequent GET request returns the updated status.
        """
        # Create two pending documents
        doc_to_approve = Document.objects.create(
            title='Tax Clearance Form',
            description='Submitted for approval.'
        )
        doc_to_reject = Document.objects.create(
            title='Incomplete Claim',
            description='Missing vital documentation.'
        )

        approve_url = reverse('document-status-update', kwargs={'pk': doc_to_approve.pk})
        reject_url = reverse('document-status-update', kwargs={'pk': doc_to_reject.pk})

        # 1. Approve document
        approve_res = self.client.patch(
            approve_url,
            data={'status': Document.Status.APPROVED},
            format='json'
        )
        self.assertEqual(approve_res.status_code, status.HTTP_200_OK)
        self.assertEqual(approve_res.json()['status'], Document.Status.APPROVED)

        # Verify database persistence for approved document
        doc_to_approve.refresh_from_db()
        self.assertEqual(doc_to_approve.status, Document.Status.APPROVED)

        # 2. Reject document
        reject_res = self.client.patch(
            reject_url,
            data={'status': Document.Status.REJECTED},
            format='json'
        )
        self.assertEqual(reject_res.status_code, status.HTTP_200_OK)
        self.assertEqual(reject_res.json()['status'], Document.Status.REJECTED)

        # Verify database persistence for rejected document
        doc_to_reject.refresh_from_db()
        self.assertEqual(doc_to_reject.status, Document.Status.REJECTED)

        # 3. Subsequent GET request returns the updated statuses
        get_response = self.client.get(self.list_create_url)
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        all_docs = {item['id']: item['status'] for item in get_response.json()}
        self.assertEqual(all_docs[doc_to_approve.id], Document.Status.APPROVED)
        self.assertEqual(all_docs[doc_to_reject.id], Document.Status.REJECTED)


class AdditionalSeniorLevelDocumentTests(TestCase):
    """
    Phase 3: Additional Senior-Level Edge-Case & Business Rule Tests.
    """

    def setUp(self):
        self.client = APIClient()
        self.list_create_url = reverse('document-list-create')

    def test_whitespace_only_title_rejected(self):
        """
        Verify that a title containing only whitespace characters is rejected with 400 Bad Request.
        """
        payload = {'title': '     ', 'description': 'Some text'}
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.json())
        self.assertEqual(Document.objects.count(), 0)

    def test_optional_description_acceptance(self):
        """
        Verify that a document can be created without a description (blank/omitted).
        """
        payload = {'title': 'Document Without Description'}
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data['title'], payload['title'])
        self.assertEqual(data['description'], '')

    def test_client_cannot_override_initial_status(self):
        """
        Verify that passing status='approved' on creation is ignored and status defaults to 'pending'.
        """
        payload = {
            'title': 'Attempt Status Override',
            'description': 'Client attempts to set approved status directly.',
            'status': 'approved'
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()['status'], Document.Status.PENDING)
        doc = Document.objects.get(title=payload['title'])
        self.assertEqual(doc.status, Document.Status.PENDING)

    def test_invalid_status_value_rejected(self):
        """
        Verify that attempting to update a document to an invalid status returns 400 Bad Request.
        """
        doc = Document.objects.create(title='Sample Document')
        url = reverse('document-status-update', kwargs={'pk': doc.pk})
        response = self.client.patch(url, data={'status': 'invalid_choice'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.json())

    def test_review_with_pending_status_rejected(self):
        """
        Verify that the review endpoint only accepts 'approved' or 'rejected', not 'pending'.
        """
        doc = Document.objects.create(title='Sample Document')
        url = reverse('document-status-update', kwargs={'pk': doc.pk})
        response = self.client.patch(url, data={'status': 'pending'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_document_id_returns_404(self):
        """
        Verify that attempting to review a non-existent document ID returns HTTP 404 Not Found.
        """
        url = reverse('document-status-update', kwargs={'pk': 999999})
        response = self.client.patch(url, data={'status': 'approved'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_already_approved_document_cannot_be_reviewed_again(self):
        """
        Verify that an approved document cannot undergo a secondary review action (Rule 4).
        """
        doc = Document.objects.create(
            title='Approved Document',
            status=Document.Status.APPROVED
        )
        url = reverse('document-status-update', kwargs={'pk': doc.pk})
        response = self.client.patch(url, data={'status': 'rejected'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.json())

    def test_already_rejected_document_cannot_be_reviewed_again(self):
        """
        Verify that a rejected document cannot undergo a secondary review action (Rule 5).
        """
        doc = Document.objects.create(
            title='Rejected Document',
            status=Document.Status.REJECTED
        )
        url = reverse('document-status-update', kwargs={'pk': doc.pk})
        response = self.client.patch(url, data={'status': 'approved'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.json())

    def test_unsupported_methods_return_405(self):
        """
        Verify that unsupported HTTP methods (e.g. DELETE or PUT) return 405 Method Not Allowed.
        """
        doc = Document.objects.create(title='Sample')
        url = reverse('document-status-update', kwargs={'pk': doc.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        put_response = self.client.put(self.list_create_url, data={'title': 'Test'}, format='json')
        self.assertEqual(put_response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_document_model_str_representation(self):
        """
        Verify Document model's __str__ method returns readable representation with title and status.
        """
        doc = Document.objects.create(title='Quarterly Budget', status=Document.Status.PENDING)
        self.assertEqual(str(doc), 'Quarterly Budget (pending)')

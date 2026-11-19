# FINAL QUALITY ASSURANCE REPORT
**Project:** Predigle Technical Assessment — Simple Document Review System  
**Date:** November 19, 2026  
**Auditor / Engineer:** Senior Full-Stack Software Engineer & QA Lead  
**Assessment Status:** **PASSED ALL REQUIREMENTS (100%)**

---

## 1. Assessment Requirement Checklist

| # | Requirement | Implementation Component | Status |
|---|---|---|---|
| **1** | Submit a document using a title and optional description | `frontend/src/components/DocumentForm.jsx`, `backend/documents/serializers.py` | **PASS** |
| **2** | Save the submission in the database | `Document.objects.create()` committed to `backend/db.sqlite3` via Django ORM | **PASS** |
| **3** | Assign `pending` status automatically to new submissions | `DocumentCreateSerializer.create()` and `Document.Status.PENDING` default | **PASS** |
| **4** | Display confirmation after successful submission | Green alert notification banner in `SubmitterPage.jsx` | **PASS** |
| **5** | Display all submissions with Title, Description, Submission Date, and Status | `DocumentCard.jsx` and `DocumentList.jsx` rendering complete metadata | **PASS** |
| **6** | Provide a reviewer page that displays all submissions | `ReviewerPage.jsx` displaying submissions ordered newest first | **PASS** |
| **7** | Allow reviewer to approve or reject pending submissions | `PATCH /api/documents/<id>/status/` with action buttons | **PASS** |
| **8** | Update document status and reflect change in submissions list | State reactivity in React + SQLite persistence surviving page reloads | **PASS** |
| **9** | Exclude file uploads, auth, and complex relationships | Scope strictly maintained without extraneous bloat | **PASS** |

---

## 2. Automated Backend Test Execution Results

Ran via `python manage.py test -v 2` in isolated SQLite test database.

### Summary:
- **Total Tests Executed:** 14
- **Passed:** 14
- **Failed:** 0
- **Errors:** 0
- **Execution Time:** 0.154 seconds

### A. Mandatory Assessment Tests (Phase 2)
| Test Identifier | Test Purpose | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| `test_01_successful_document_submission` | Create document with valid title and description | HTTP 201 Created, saved in DB, correct fields, generated ID, status `pending`, timestamp present | HTTP 201, DB count = 1, status = `pending`, timestamp valid | **PASS** |
| `test_02_reject_empty_title` | Submit document with empty string title | HTTP 400 Bad Request, validation error returned on `title`, DB count = 0 | HTTP 400, `'title'` error returned, 0 records in DB | **PASS** |
| `test_03_retrieve_submissions_and_empty_list` | GET all documents and test empty database | HTTP 200 OK with `[]` when empty; HTTP 200 with populated array when records exist | HTTP 200 with `[]`, then HTTP 200 with 2 records matching expected schema | **PASS** |
| `test_04_update_document_status` | Approve and reject pending documents via PATCH | HTTP 200 OK, database updated, subsequent GET returns updated status | HTTP 200, DB statuses updated to `approved` and `rejected`, subsequent GET reflects updates | **PASS** |

### B. Additional Senior-Level Edge Case Tests (Phase 3)
| Test Identifier | Test Purpose | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| `test_whitespace_only_title_rejected` | Submit title consisting only of spaces (`"   "`) | HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** |
| `test_optional_description_acceptance` | Submit document omitting description field | HTTP 201 Created, description set to `""` | HTTP 201 Created, description is empty string | **PASS** |
| `test_client_cannot_override_initial_status` | Client attempts to send `{"status": "approved"}` on create | HTTP 201 Created, but status forced to `pending` | HTTP 201 Created, status persisted as `pending` | **PASS** |
| `test_invalid_status_value_rejected` | Client attempts review with invalid status value | HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** |
| `test_review_with_pending_status_rejected` | Client attempts to review document back to `pending` | HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** |
| `test_missing_document_id_returns_404` | Review status on non-existent ID `999999` | HTTP 404 Not Found | HTTP 404 Not Found | **PASS** |
| `test_already_approved_document_cannot_be_reviewed_again` | Review action on already approved document | HTTP 400 Bad Request (terminal status) | HTTP 400 Bad Request | **PASS** |
| `test_already_rejected_document_cannot_be_reviewed_again` | Review action on already rejected document | HTTP 400 Bad Request (terminal status) | HTTP 400 Bad Request | **PASS** |
| `test_unsupported_methods_return_405` | Attempt DELETE or PUT on API endpoints | HTTP 405 Method Not Allowed | HTTP 405 Method Not Allowed | **PASS** |
| `test_document_model_str_representation` | Verify `__str__` returns title and status | String matches `"{title} ({status})"` | String matches expected format | **PASS** |

---

## 3. Frontend Testing & Live Verification Results

Tested via headless browser automation against the live running Django backend and Vite React development server:

- **Submitter Portal:**
  - Form validation: Rejects blank and whitespace-only titles with a clean alert message.
  - Submitting realistic documents: Successfully posted 3 documents to the backend.
  - Visual feedback: Displayed green confirmation banner (`"Document submitted successfully."`).
  - List rendering: Displays documents in reverse-chronological order with ID, Title, Description, Date, and Amber `pending` StatusBadge.
- **Reviewer Queue:**
  - Tab navigation: Switching between Submitter and Reviewer tabs preserves state and displays pending badge count.
  - Action buttons: Pending cards display green **Approve** and red **Reject** buttons.
  - Review action execution: Document #1 was approved; Document #3 was rejected.
  - Status updates: Status badges immediately transitioned to green `approved` and red `rejected`.
  - Terminal status restriction: Buttons were immediately replaced by `Review completed: approved` / `Review completed: rejected` text.
- **Reload & Persistence Verification:**
  - Browser was hard-reloaded (`F5`).
  - Fetched all documents afresh from SQLite via `GET /api/documents/`.
  - Both approved and rejected statuses remained fully persisted.

---

## 4. Bugs Discovered & Fixes Applied

1. **Host Header in Django Test Client:**
   - *Issue:* Initial test execution with Django's test client raised `DisallowedHost: Invalid HTTP_HOST header: 'testserver'`.
   - *Fix:* Added `'testserver'` to `ALLOWED_HOSTS` in `backend/config/settings.py`.
2. **Whitespace-Only Title Validation:**
   - *Issue:* Default DRF `CharField` accepts non-empty whitespace unless stripped.
   - *Fix:* Implemented explicit `validate_title()` in `DocumentCreateSerializer` using `.strip()` to reject whitespace-only submissions and guarantee clean database records.
3. **CORS Port Flexibility:**
   - *Issue:* Vite may assign port `5174` if `5173` is busy.
   - *Fix:* Configured `CORS_ALLOWED_ORIGINS` to include both `5173` and `5174` for `localhost` and `127.0.0.1`.

---

## 5. Assessment Screenshot Inventory

All four required screenshots were captured from the running application and verified on disk in `screenshots/`:

| File Name | Description | Size | Verification Status |
|---|---|---|---|
| [`screenshots/submission-form.png`](file:///c:/Users/jasmi/Desktop/Document%20Review%20System/screenshots/submission-form.png) | Submitter portal showing document submission form | 123.7 KB | **VERIFIED** |
| [`screenshots/submissions-list.png`](file:///c:/Users/jasmi/Desktop/Document%20Review%20System/screenshots/submissions-list.png) | Submissions list showing document details, dates, and pending status | 138.6 KB | **VERIFIED** |
| [`screenshots/reviewer-page.png`](file:///c:/Users/jasmi/Desktop/Document%20Review%20System/screenshots/reviewer-page.png) | Reviewer page displaying pending submissions with Approve/Reject buttons | 183.0 KB | **VERIFIED** |
| [`screenshots/updated-status.png`](file:///c:/Users/jasmi/Desktop/Document%20Review%20System/screenshots/updated-status.png) | Reviewer page displaying updated approved and rejected statuses | 182.7 KB | **VERIFIED** |

---

## 6. README Completion Status

- Complete root-level [`README.md`](file:///c:/Users/jasmi/Desktop/Document%20Review%20System/README.md) written and verified.
- Contains all 20 required sections: Project Title, Overview, Problem Statement, Features, Tech Stack, Directory Structure, Architecture, Database Model, API Endpoints, PowerShell Backend Setup, Migration Commands, Frontend Setup, Local URLs, Test Instructions, Manual Testing Steps, Relative Screenshot Markdown Links, and Known Limitations.

---

## 7. Commands to Run the Application

### Backend (Terminal 1)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

### Frontend (Terminal 2)
```powershell
cd frontend
npm install
npm run dev
```

### Run Automated Tests (Terminal 1)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py test -v 2
```

---

## 8. Remaining Limitations

- Authentication and user permissions are intentionally not implemented per assessment specifications.
- File uploads are not required and not implemented; this is a document metadata management system.
- Application is configured for local development and testing.

---

## 9. GitHub Status

- **Zero commits made to remote.**
- **No changes pushed to GitHub.**
- All deliverables are prepared locally in your workspace awaiting your explicit review and instruction.

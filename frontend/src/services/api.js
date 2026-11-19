/**
 * API Service for Simple Document Review System
 *
 * Centralizes all HTTP communication with the Django REST Framework backend.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

/**
 * Helper to parse backend error responses and generate user-friendly error messages.
 */
async function handleResponseError(response) {
  let errorMessage = `Request failed with status ${response.status}`;
  try {
    const errorData = await response.json();
    if (typeof errorData === 'string') {
      errorMessage = errorData;
    } else if (Array.isArray(errorData)) {
      errorMessage = errorData.join(', ');
    } else if (typeof errorData === 'object' && errorData !== null) {
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else {
        // Collect field-specific validation errors (e.g., { title: ['This field may not be blank.'] })
        const messages = Object.entries(errorData).map(([field, errs]) => {
          const detail = Array.isArray(errs) ? errs.join(' ') : String(errs);
          return `${field}: ${detail}`;
        });
        if (messages.length > 0) {
          errorMessage = messages.join(' | ');
        }
      }
    }
  } catch {
    // If response body is not JSON, retain default status message
  }
  return new Error(errorMessage);
}

/**
 * FUNCTION 1: createDocument(data)
 * Submits a new document to the backend.
 *
 * @param {Object} data - { title: string, description?: string }
 * @returns {Promise<Object>} The created document record (HTTP 201)
 */
export async function createDocument(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: data.title ? data.title.trim() : '',
        description: data.description || '',
      }),
    });

    if (!response.ok) {
      throw await handleResponseError(response);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Unable to connect to the backend server. Please verify the Django server is running.');
    }
    throw error;
  }
}

/**
 * FUNCTION 2: getDocuments()
 * Retrieves all document submissions from the backend ordered newest first.
 *
 * @returns {Promise<Array>} Array of document objects (HTTP 200)
 */
export async function getDocuments() {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw await handleResponseError(response);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Unable to connect to the backend server. Please verify the Django server is running.');
    }
    throw error;
  }
}

/**
 * FUNCTION 3: updateDocumentStatus(id, status)
 * Updates the review status of a pending document to 'approved' or 'rejected'.
 *
 * @param {number|string} id - Document primary key
 * @param {'approved'|'rejected'} status - New review status
 * @returns {Promise<Object>} The updated document record (HTTP 200)
 */
export async function updateDocumentStatus(id, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/status/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw await handleResponseError(response);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Unable to connect to the backend server. Please verify the Django server is running.');
    }
    throw error;
  }
}

/**
 * Auto-save Hook for CV
 * Saves CV automatically after specified delay
 */

import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

export const useAutoSave = (cvId, delayMs = 5000) => {
  const dispatch = useDispatch();
  const cvData = useSelector((state) => state.cv.currentCV);
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef(null);

  const saveCV = useCallback(async () => {
    try {
      if (!cvId || !cvData) return;

      // Only save if data has changed
      const currentDataString = JSON.stringify(cvData);
      if (lastSavedRef.current === currentDataString) {
        return;
      }

      const response = await axios.put(
        `/api/cvs/${cvId}`,
        { data: cvData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        lastSavedRef.current = currentDataString;
        console.log('CV auto-saved successfully');
        
        // Dispatch success action if needed
        // dispatch(updateAutoSaveStatus({ status: 'saved', timestamp: new Date() }));
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Dispatch error action if needed
      // dispatch(updateAutoSaveStatus({ status: 'failed', error: error.message }));
    }
  }, [cvId, cvData, dispatch]);

  // Setup auto-save with debounce
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      saveCV();
    }, delayMs);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cvData, delayMs, saveCV]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Save immediately before leaving
      saveCV();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveCV]);

  return {
    saveCV,
    isSaving: false, // Can be extended with Redux state
  };
};

/**
 * Local Storage Auto-save (Draft Saving)
 */
export const useLocalAutoSave = (cvId, delayMs = 3000) => {
  const cvData = useSelector((state) => state.cv.currentCV);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!cvId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        const draftKey = `cv-draft-${cvId}`;
        localStorage.setItem(draftKey, JSON.stringify({
          data: cvData,
          savedAt: new Date().toISOString(),
        }));
        console.log('Draft saved to local storage');
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    }, delayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cvData, cvId, delayMs]);
};

/**
 * Recover draft from local storage
 */
export const recoverDraftFromStorage = (cvId) => {
  try {
    const draftKey = `cv-draft-${cvId}`;
    const draft = localStorage.getItem(draftKey);
    
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      return {
        data: parsedDraft.data,
        savedAt: parsedDraft.savedAt,
      };
    }
  } catch (error) {
    console.error('Failed to recover draft:', error);
  }
  
  return null;
};

/**
 * Clear draft from local storage
 */
export const clearDraftFromStorage = (cvId) => {
  try {
    const draftKey = `cv-draft-${cvId}`;
    localStorage.removeItem(draftKey);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
};

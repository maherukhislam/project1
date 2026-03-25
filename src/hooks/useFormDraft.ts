import { useState, useEffect, useCallback } from 'react';

/**
 * A hook that synchronizes form state with localStorage for draft saving.
 * 
 * @param key The unique string key used to store the draft in localStorage.
 * @param initialData The default starting state for the form.
 * @param dependencies Optional array. When any value in this array changes, the draft is re-evaluated.
 * @returns A tuple containing:
 *  - [0] data: The active form data (merged from draft if found)
 *  - [1] setData: React state setter for the data
 *  - [2] clearDraft: A function to wipe the draft from localStorage (e.g., on successful submit)
 *  - [3] hasRestored: Boolean indicating if a draft was found and loaded
 */
export function useFormDraft<T>(
  key: string,
  initialData: T,
  dependencies: any[] = []
): [T, React.Dispatch<React.SetStateAction<T>>, () => void, boolean] {
  const draftKey = `draft_${key}`;
  
  const [data, setData] = useState<T>(initialData);
  const [hasRestored, setHasRestored] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. On mount (or when dependencies change), attempt to load from draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        // Deep merge draft data over initialData so new fields in the model schemas don't break
        const parsedNode = JSON.parse(saved);
        setData(prev => {
          if (typeof parsedNode === 'object' && parsedNode !== null && !Array.isArray(parsedNode)) {
             return { ...prev, ...parsedNode };
          }
          return parsedNode;
        });
        setHasRestored(true);
      }
    } catch (e) {
      console.warn(`[useFormDraft] Failed to parse draft for ${draftKey}`, e);
    } finally {
      setIsInitialized(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // 2. Automatically save the draft whenever `data` changes
  useEffect(() => {
    // Prevent saving the initial state back over the draft during the very first render cycle
    if (!isInitialized) return;
    
    try {
      localStorage.setItem(draftKey, JSON.stringify(data));
    } catch (e) {
      console.warn(`[useFormDraft] Failed to save draft for ${draftKey}`, e);
    }
  }, [data, draftKey, isInitialized]);

  // 3. Provide a way to manually clear the draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      setHasRestored(false);
    } catch (e) {
      console.error(`[useFormDraft] Failed to clear draft`, e);
    }
  }, [draftKey]);

  return [data, setData, clearDraft, hasRestored];
}

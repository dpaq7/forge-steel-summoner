import { useState, useEffect, useCallback } from 'react';
import { PortraitSettings, DEFAULT_PORTRAIT_SETTINGS } from '../types/portrait';
import { processPortraitImage, validateImageUrl } from '../utils/imageProcessing';
import { useSummonerContext } from '../context/SummonerContext';

const PORTRAIT_STORAGE_PREFIX = 'summoner_portrait_';

/**
 * Hook for managing character portrait settings
 * Portrait data is stored separately from character data to avoid bloating saves
 */
export function usePortrait() {
  const { hero } = useSummonerContext();
  const [portrait, setPortraitState] = useState<PortraitSettings>(DEFAULT_PORTRAIT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Storage key based on character ID
  const storageKey = hero?.id ? `${PORTRAIT_STORAGE_PREFIX}${hero.id}` : null;

  // Load portrait settings from localStorage when character changes
  useEffect(() => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as PortraitSettings;
          setPortraitState(parsed);
        } else {
          setPortraitState(DEFAULT_PORTRAIT_SETTINGS);
        }
      } catch (e) {
        console.error('Failed to load portrait settings:', e);
        setPortraitState(DEFAULT_PORTRAIT_SETTINGS);
      }
    }
  }, [storageKey]);

  // Save portrait settings to localStorage
  const savePortrait = useCallback(
    (settings: PortraitSettings) => {
      if (!storageKey) return;

      try {
        localStorage.setItem(storageKey, JSON.stringify(settings));
        setError(null);
      } catch (e) {
        // Likely quota exceeded
        console.error('Failed to save portrait:', e);
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          setError('Storage quota exceeded. Try using a smaller image or URL.');
        } else {
          setError('Failed to save portrait settings.');
        }
      }
    },
    [storageKey]
  );

  // Update portrait settings
  const setPortrait = useCallback(
    (updates: Partial<PortraitSettings>) => {
      setPortraitState((prev) => {
        const newSettings = { ...prev, ...updates };
        savePortrait(newSettings);
        return newSettings;
      });
    },
    [savePortrait]
  );

  // Upload and process an image file
  const uploadPortrait = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const base64 = await processPortraitImage(file);
        const newSettings: PortraitSettings = {
          ...portrait,
          source: 'upload',
          imageData: base64,
        };
        setPortraitState(newSettings);
        savePortrait(newSettings);
      } catch (e) {
        console.error('Failed to process image:', e);
        setError('Failed to process image. Please try a different file.');
      } finally {
        setIsLoading(false);
      }
    },
    [portrait, savePortrait]
  );

  // Set portrait from URL
  const setPortraitUrl = useCallback(
    async (url: string) => {
      setIsLoading(true);
      setError(null);

      const isValid = await validateImageUrl(url);
      if (!isValid) {
        setError('Could not load image from URL. Please check the URL and try again.');
        setIsLoading(false);
        return false;
      }

      const newSettings: PortraitSettings = {
        ...portrait,
        source: 'url',
        imageData: url,
      };
      setPortraitState(newSettings);
      savePortrait(newSettings);
      setIsLoading(false);
      return true;
    },
    [portrait, savePortrait]
  );

  // Remove portrait and revert to default
  const removePortrait = useCallback(() => {
    const newSettings: PortraitSettings = {
      ...DEFAULT_PORTRAIT_SETTINGS,
      // Preserve user's preferred display settings
      opacity: portrait.opacity,
      position: portrait.position,
      scale: portrait.scale,
      grayscale: portrait.grayscale,
      border: portrait.border,
    };
    setPortraitState(newSettings);
    savePortrait(newSettings);
    setError(null);
  }, [portrait, savePortrait]);

  // Reset everything to defaults
  const resetToDefault = useCallback(() => {
    setPortraitState(DEFAULT_PORTRAIT_SETTINGS);
    savePortrait(DEFAULT_PORTRAIT_SETTINGS);
    setError(null);
  }, [savePortrait]);

  // Check if a portrait is set
  const hasPortrait = portrait.source !== 'default' && portrait.imageData !== null;

  return {
    portrait,
    setPortrait,
    uploadPortrait,
    setPortraitUrl,
    removePortrait,
    resetToDefault,
    hasPortrait,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

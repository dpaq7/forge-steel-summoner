import React, { useState, useRef, useCallback } from 'react';
import { PortraitSettings, DEFAULT_PORTRAIT_SETTINGS } from '../../types/portrait';
import { processPortraitImage, isValidImageUrl, getBase64SizeKB } from '../../utils/imageProcessing';
import PortraitControls from './PortraitControls';

interface PortraitUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: PortraitSettings;
  onApply: (settings: PortraitSettings) => void;
  onUpload: (file: File) => Promise<void>;
  onSetUrl: (url: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const PortraitUploader: React.FC<PortraitUploaderProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onApply,
  onUpload,
  onSetUrl,
  isLoading,
  error,
}) => {
  // Local state for preview and editing
  const [previewSettings, setPreviewSettings] = useState<PortraitSettings>(currentSettings);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset preview when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPreviewSettings(currentSettings);
      setUrlInput('');
      setUrlError(null);
      setLocalError(null);
    }
  }, [isOpen, currentSettings]);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setLocalError('Please select an image file.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setLocalError('Image is too large (max 10MB). Please choose a smaller file.');
        return;
      }

      setLocalError(null);

      try {
        const base64 = await processPortraitImage(file);
        const sizeKB = getBase64SizeKB(base64);

        if (sizeKB > 800) {
          setLocalError(
            `Image is still large after compression (${sizeKB}KB). Consider using a smaller image.`
          );
        }

        setPreviewSettings((prev) => ({
          ...prev,
          source: 'upload',
          imageData: base64,
        }));
      } catch (e) {
        setLocalError('Failed to process image. Please try a different file.');
      }
    },
    []
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // Handle URL input
  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) {
      setUrlError('Please enter a URL.');
      return;
    }

    if (!isValidImageUrl(urlInput)) {
      setUrlError('Please enter a valid image URL.');
      return;
    }

    setUrlError(null);

    // Test if URL loads
    const img = new Image();
    img.crossOrigin = 'anonymous';

    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = urlInput;
      });

      setPreviewSettings((prev) => ({
        ...prev,
        source: 'url',
        imageData: urlInput,
      }));
      setUrlInput('');
    } catch {
      setUrlError('Could not load image from URL. Please check the URL.');
    }
  }, [urlInput]);

  // Handle apply
  const handleApply = useCallback(() => {
    onApply(previewSettings);
    onClose();
  }, [previewSettings, onApply, onClose]);

  // Handle remove portrait
  const handleRemove = useCallback(() => {
    setPreviewSettings({
      ...DEFAULT_PORTRAIT_SETTINGS,
      opacity: previewSettings.opacity,
      position: previewSettings.position,
      scale: previewSettings.scale,
      grayscale: previewSettings.grayscale,
      border: previewSettings.border,
    });
  }, [previewSettings]);

  // Handle settings change
  const handleSettingsChange = useCallback((updates: Partial<PortraitSettings>) => {
    setPreviewSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  if (!isOpen) return null;

  const hasPortrait = previewSettings.source !== 'default' && previewSettings.imageData !== null;
  const displayError = localError || error;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="portrait-uploader" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Character Portrait</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="portrait-uploader__content">
          {/* Preview Area */}
          <div
            className={`portrait-uploader__preview ${hasPortrait ? 'has-image' : ''} ${isDragging ? 'dragging' : ''}`}
            style={
              {
                '--portrait-opacity': previewSettings.opacity,
                '--portrait-scale': previewSettings.scale,
              } as React.CSSProperties
            }
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {hasPortrait ? (
              <img
                src={previewSettings.imageData!}
                alt="Portrait preview"
                className={`preview-image ${previewSettings.grayscale ? 'grayscale' : ''}`}
                style={{
                  objectPosition:
                    previewSettings.position === 'top'
                      ? 'center top'
                      : previewSettings.position === 'bottom'
                        ? 'center bottom'
                        : 'center center',
                  transform: `scale(${previewSettings.scale})`,
                }}
              />
            ) : (
              <div className="portrait-uploader__dropzone">
                <div className="dropzone-icon">
                  <svg viewBox="0 0 24 24" width="48" height="48">
                    <path
                      fill="currentColor"
                      d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"
                    />
                  </svg>
                </div>
                <p>Drag & drop an image here</p>
                <p className="hint">or use the buttons below</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="portrait-uploader__actions">
            <button
              className="action-btn upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = '';
              }}
            />

            <div className="url-input-group">
              <input
                type="text"
                placeholder="Or paste image URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <button
                className="action-btn url-btn"
                onClick={handleUrlSubmit}
                disabled={isLoading || !urlInput.trim()}
              >
                Use URL
              </button>
            </div>

            {urlError && <p className="error-text">{urlError}</p>}
          </div>

          {/* Quick Options */}
          <div className="portrait-uploader__quick-options">
            <button className="quick-option" onClick={handleRemove}>
              Use Default Silhouette
            </button>
          </div>

          {/* Adjustments */}
          <div className="portrait-uploader__adjustments">
            <h4>Adjustments</h4>
            <PortraitControls settings={previewSettings} onChange={handleSettingsChange} />
          </div>

          {/* Error Display */}
          {displayError && (
            <div className="portrait-uploader__error">
              <p>{displayError}</p>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="portrait-uploader__loading">
              <span className="spinner"></span>
              <p>Processing image...</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="portrait-uploader__footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleApply} disabled={isLoading}>
            Apply Portrait
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortraitUploader;

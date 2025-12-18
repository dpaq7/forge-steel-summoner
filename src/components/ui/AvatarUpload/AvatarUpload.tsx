import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Plus, Pencil, Trash2, Upload, X, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/shadcn/alert-dialog';

import './AvatarUpload.css';

interface AvatarUploadProps {
  currentPortrait?: string | null;
  characterName: string;
  onPortraitChange: (portraitUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
}

// Accepted image types
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSION = 256; // Max width/height for compression

/**
 * Compress an image to a maximum size while maintaining aspect ratio
 */
const compressImage = (
  dataUrl: string,
  maxWidth: number = MAX_IMAGE_DIMENSION,
  maxHeight: number = MAX_IMAGE_DIMENSION,
  quality: number = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to data URL (JPEG for smaller size)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = dataUrl;
  });
};

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentPortrait,
  characterName,
  onPortraitChange,
  size = 'md',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasPortrait = !!currentPortrait;
  const initial = characterName.charAt(0).toUpperCase();

  // Handle file selection
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please select a PNG, JPG, or WebP image');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;

      // Compress if larger than 100KB
      let finalUrl = dataUrl;
      if (dataUrl.length > 100 * 1024) {
        try {
          finalUrl = await compressImage(dataUrl);
        } catch {
          console.warn('Failed to compress image, using original');
        }
      }

      setPreviewUrl(finalUrl);
      setShowPreview(true);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    e.target.value = '';
  }, []);

  // Trigger file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Confirm portrait change
  const confirmPortrait = () => {
    if (previewUrl) {
      onPortraitChange(previewUrl);
      setShowPreview(false);
      setPreviewUrl(null);
    }
  };

  // Cancel preview
  const cancelPreview = () => {
    setShowPreview(false);
    setPreviewUrl(null);
  };

  // Remove portrait
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRemoveConfirm(true);
  };

  const confirmRemove = () => {
    onPortraitChange(null);
    setShowRemoveConfirm(false);
  };

  // Clear error after timeout
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <>
      <div
        className={`avatar-upload avatar-upload-${size} ${hasPortrait ? 'has-portrait' : 'no-portrait'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="avatar-file-input"
          aria-label="Upload portrait"
        />

        {/* Avatar Display */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              className="avatar-button"
              onClick={openFilePicker}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
            >
              {hasPortrait ? (
                // Portrait Image
                <img
                  src={currentPortrait}
                  alt={`${characterName}'s portrait`}
                  className="avatar-image"
                />
              ) : (
                // Fallback Avatar
                <div className="avatar-fallback">
                  <span className="avatar-initial">{initial}</span>
                  <div className="avatar-add-indicator">
                    <Camera className="indicator-icon" />
                    <Plus className="indicator-plus" />
                  </div>
                </div>
              )}

              {/* Hover Overlay */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    className="avatar-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {hasPortrait ? (
                      <div className="overlay-actions">
                        <div className="overlay-action change">
                          <Pencil className="overlay-icon" />
                          <span>Change</span>
                        </div>
                      </div>
                    ) : (
                      <div className="overlay-prompt">
                        <Upload className="overlay-icon" />
                        <span>Add Photo</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {hasPortrait ? 'Click to change portrait' : 'Click to add portrait'}
          </TooltipContent>
        </Tooltip>

        {/* Remove Button (only when has portrait and hovered) */}
        <AnimatePresence>
          {hasPortrait && isHovered && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className="avatar-remove-btn"
                  onClick={handleRemove}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                >
                  <Trash2 className="w-3 h-3" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right">Remove portrait</TooltipContent>
            </Tooltip>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="avatar-error"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="avatar-preview-dialog" variant="fantasy">
          <AlertDialogHeader>
            <AlertDialogTitle>Preview Portrait</AlertDialogTitle>
            <AlertDialogDescription>
              This image will be used as {characterName}'s portrait.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="preview-container">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Portrait preview"
                className="preview-image"
              />
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelPreview}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmPortrait}>
              <Check className="w-4 h-4 mr-2" />
              Use This Portrait
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent variant="fantasy">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Portrait?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {characterName}'s portrait and show the default avatar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="destructive"
            >
              Remove Portrait
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AvatarUpload;

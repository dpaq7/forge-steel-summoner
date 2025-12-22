import { useState, useCallback } from 'react';
import type { Hero } from '@/types';
import {
  downloadCharacterJSON,
  duplicateCharacter,
  saveCharacter,
  deleteCharacter,
  getAllCharacters,
} from '@/utils/storage';

interface UseCharacterManagementProps {
  hero: Hero | null;
  setHero: (hero: Hero | null) => void;
}

/**
 * Custom hook for character management operations (export, import, duplicate, delete)
 */
export function useCharacterManagement({ hero, setHero }: UseCharacterManagementProps) {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Hero | null>(null);

  /**
   * Export current character to JSON file
   */
  const handleExportCharacter = useCallback(() => {
    if (hero) {
      downloadCharacterJSON(hero);
    }
  }, [hero]);

  /**
   * Open the import dialog
   */
  const handleImportCharacter = useCallback(() => {
    setShowImportDialog(true);
  }, []);

  /**
   * Handle imported character - save and switch to it
   */
  const handleImportComplete = useCallback(
    (importedHero: Hero) => {
      setHero(importedHero);
    },
    [setHero]
  );

  /**
   * Duplicate current character
   */
  const handleDuplicateCharacter = useCallback(() => {
    if (hero) {
      const duplicate = duplicateCharacter(hero);
      saveCharacter(duplicate);
      setHero(duplicate);
    }
  }, [hero, setHero]);

  /**
   * Open delete confirmation dialog
   */
  const handleDeleteCharacterClick = useCallback(() => {
    if (hero) {
      setCharacterToDelete(hero);
      setShowDeleteDialog(true);
    }
  }, [hero]);

  /**
   * Confirm delete - remove character and switch to another
   */
  const handleConfirmDelete = useCallback(() => {
    if (!characterToDelete) return;

    // Get all characters to find another one to switch to
    const allCharacters = getAllCharacters();
    const remainingCharacters = allCharacters.filter((c) => c.id !== characterToDelete.id);

    // Delete the character
    deleteCharacter(characterToDelete.id);

    // Switch to another character or return null
    if (remainingCharacters.length > 0) {
      setHero(remainingCharacters[0].data);
    } else {
      setHero(null);
    }

    // Close dialog and clear state
    setShowDeleteDialog(false);
    setCharacterToDelete(null);
  }, [characterToDelete, setHero]);

  /**
   * Cancel delete
   */
  const handleCancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
    setCharacterToDelete(null);
  }, []);

  return {
    // Dialog state
    showImportDialog,
    setShowImportDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    characterToDelete,

    // Handlers
    handleExportCharacter,
    handleImportCharacter,
    handleImportComplete,
    handleDuplicateCharacter,
    handleDeleteCharacterClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
}

export default useCharacterManagement;

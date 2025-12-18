import React, { useState, useRef } from 'react';
import { useSummonerContext } from '../../context/HeroContext';
import { Hero, isSummonerHero } from '../../types/hero';
import { classDefinitions } from '../../data/classes/class-definitions';
import {
  getAllCharacters,
  deleteCharacter,
  downloadCharacterJSON,
  importCharacterFromJSON,
  saveCharacter,
  StoredCharacter,
} from '../../utils/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  ScrollArea,
} from '@/components/ui/shadcn';
import { Plus, Upload, Download, Trash2, Users, Check } from 'lucide-react';
import './CharacterManager.css';

// Get display details for a hero based on their class
const getHeroDisplayInfo = (hero: Hero): { class: string; subinfo: string } => {
  const classDef = classDefinitions[hero.heroClass];
  const className = classDef?.name ?? 'Unknown';

  if (isSummonerHero(hero)) {
    const portfolioType = hero.portfolio?.type ?? 'unknown';
    return {
      class: className,
      subinfo: `${portfolioType.charAt(0).toUpperCase() + portfolioType.slice(1)} Portfolio, ${hero.formation} Formation`,
    };
  }

  // For other classes, show their subclass if selected
  return {
    class: className,
    subinfo: classDef?.role ?? '',
  };
};

interface CharacterManagerProps {
  onClose: () => void;
  onCreateNew: () => void;
  onCharacterLoaded?: () => void;
}

const CharacterManager: React.FC<CharacterManagerProps> = ({ onClose, onCreateNew, onCharacterLoaded }) => {
  const { hero, loadHero, setHero } = useSummonerContext();
  const [characters, setCharacters] = useState<StoredCharacter[]>(getAllCharacters());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wrap onClose for Dialog's onOpenChange pattern
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const refreshCharacters = () => {
    setCharacters(getAllCharacters());
  };

  const handleLoadCharacter = (id: string) => {
    loadHero(id);
    // Use onCharacterLoaded if provided (exits creation mode), otherwise just close
    if (onCharacterLoaded) {
      onCharacterLoaded();
    } else {
      onClose();
    }
  };

  const handleDeleteCharacter = (id: string) => {
    deleteCharacter(id);
    refreshCharacters();
    setDeleteConfirm(null);

    // If we deleted the current character, clear it
    if (hero?.id === id) {
      setHero(null);
    }
  };

  const handleExportCharacter = (character: StoredCharacter) => {
    downloadCharacterJSON(character.data);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      const result = importCharacterFromJSON(json);

      if (result.valid && result.hero) {
        // Save the imported hero
        saveCharacter(result.hero);
        loadHero(result.hero.id);
        refreshCharacters();

        // Show warnings if any
        if (result.warnings.length > 0) {
          console.log('Import warnings:', result.warnings);
        }

        // Use onCharacterLoaded if provided (exits creation mode), otherwise just close
        if (onCharacterLoaded) {
          onCharacterLoaded();
        } else {
          onClose();
        }
      } else {
        const errorMsg = result.errors.length > 0
          ? `Import failed:\n${result.errors.join('\n')}`
          : 'Failed to import character. Invalid file format.';
        alert(errorMsg);
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be imported again
    event.target.value = '';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get the character being deleted for the confirmation dialog
  const characterToDelete = deleteConfirm
    ? characters.find(c => c.id === deleteConfirm)
    : null;

  return (
    <>
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent variant="scroll" className="character-manager-dialog max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--accent-primary)]" />
              Character Management
            </DialogTitle>
            <DialogDescription>
              {characters.length} {characters.length === 1 ? 'character' : 'characters'} saved
            </DialogDescription>
          </DialogHeader>

          {/* Action buttons */}
          <div className="manager-actions-new">
            <Button variant="heroic" onClick={onCreateNew} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Create New Character
            </Button>
            <Button variant="outline" onClick={handleImportClick} className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Import Character
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Character list */}
          <ScrollArea className="character-list-scroll h-[400px] pr-4">
            {characters.length === 0 ? (
              <div className="no-characters-new">
                <Users className="h-12 w-12 text-[var(--text-dim)] mb-4" />
                <p className="text-[var(--text-primary)] font-medium mb-1">No characters found</p>
                <p className="text-[var(--text-muted)] text-sm">Create a new character to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {characters.map((character) => {
                  const isActive = hero?.id === character.id;
                  const displayInfo = getHeroDisplayInfo(character.data);

                  return (
                    <div
                      key={character.id}
                      className={`character-card-new ${isActive ? 'active' : ''}`}
                    >
                      <div className="character-card-info">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-[var(--text-primary)]">
                            {character.name}
                          </h3>
                          {isActive && (
                            <span className="active-badge-new">
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          Level {character.level} {displayInfo.class}
                          {displayInfo.subinfo && (
                            <span className="text-[var(--text-muted)]"> • {displayInfo.subinfo}</span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-dim)] mt-1">
                          Last modified: {formatDate(character.lastModified)}
                        </div>
                      </div>

                      <div className="character-card-actions">
                        {!isActive && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleLoadCharacter(character.id)}
                          >
                            Load
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportCharacter(character)}
                          title="Export to JSON"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteConfirm(character.id)}
                          title="Delete character"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="chamfered" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent variant="fantasy" className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[var(--color-danger)]">
              <Trash2 className="h-5 w-5" />
              Delete Character?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong className="text-[var(--text-primary)]">
                {characterToDelete?.name}
              </strong>
              ? This action cannot be undone and all character data will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteCharacter(deleteConfirm)}
              className="bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CharacterManager;

import * as React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/shadcn';
import type { Hero } from '@/types';

interface DeleteCharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Hero | null;
  onConfirm: () => void;
  isCurrentCharacter?: boolean;
}

// Format subclass for display
const formatSubclass = (subclass: string): string => {
  return subclass
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const DeleteCharacterDialog: React.FC<DeleteCharacterDialogProps> = ({
  open,
  onOpenChange,
  character,
  onConfirm,
  isCurrentCharacter = false,
}) => {
  if (!character) return null;

  const canDelete = !isCurrentCharacter;
  const deleteBlockedReason = isCurrentCharacter
    ? 'Cannot delete the currently active character. Switch to another character first.'
    : undefined;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent variant="fantasy" className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
            Delete Character?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {canDelete ? (
                <>
                  Are you sure you want to delete{' '}
                  <strong className="text-[var(--text-primary)]">{character.name}</strong>?
                  <span className="block mt-2 text-[var(--danger)] font-medium text-sm">
                    This action cannot be undone. All character data will be permanently lost.
                  </span>
                </>
              ) : (
                <span className="text-[var(--warning)]">
                  {deleteBlockedReason}
                </span>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {canDelete && (
          <div className="p-3 bg-[var(--bg-darkest)] border border-[var(--danger)] border-l-4 rounded my-2">
            <div className="font-bold text-[var(--text-primary)]">{character.name}</div>
            <div className="text-xs text-[var(--text-secondary)] capitalize">
              Level {character.level} {character.heroClass}
              {character.subclass && ` • ${formatSubclass(character.subclass)}`}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              onClick={onConfirm}
              className="bg-[var(--danger)] hover:bg-[#ff4444] text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Forever
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCharacterDialog;

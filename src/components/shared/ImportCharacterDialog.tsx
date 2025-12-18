import * as React from 'react';
import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import './ImportCharacterDialog.css';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/ui/shadcn';
import { importCharacterFromJSON, saveCharacter, type ImportValidationResult } from '@/utils/storage';
import type { Hero } from '@/types';

interface ImportCharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (hero: Hero) => void;
  existingNames: string[];
}

type ImportState = 'idle' | 'validating' | 'valid' | 'invalid';

export const ImportCharacterDialog: React.FC<ImportCharacterDialogProps> = ({
  open,
  onOpenChange,
  onImport,
  existingNames,
}) => {
  const [importState, setImportState] = useState<ImportState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedHero, setParsedHero] = useState<Hero | null>(null);
  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const [nameConflict, setNameConflict] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setImportState('idle');
      setSelectedFile(null);
      setParsedHero(null);
      setValidation(null);
      setNameConflict(false);
    }
    onOpenChange(isOpen);
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportState('validating');
    setParsedHero(null);
    setValidation(null);
    setNameConflict(false);

    try {
      const text = await file.text();
      const result = importCharacterFromJSON(text);
      setValidation(result);

      if (result.valid && result.hero) {
        setParsedHero(result.hero);
        setImportState('valid');

        // Check for name conflict
        if (existingNames.some(name =>
          name.toLowerCase() === result.hero!.name.toLowerCase()
        )) {
          setNameConflict(true);
        }
      } else {
        setImportState('invalid');
      }
    } catch (error) {
      setValidation({
        valid: false,
        errors: ['Failed to read file'],
        warnings: [],
        hero: null,
      });
      setImportState('invalid');
    }

    // Reset input
    e.target.value = '';
  };

  // Handle import confirmation
  const handleConfirmImport = () => {
    if (parsedHero) {
      // Rename if conflict
      let heroToImport = parsedHero;
      if (nameConflict) {
        heroToImport = {
          ...parsedHero,
          name: `${parsedHero.name} (Imported)`,
        };
      }

      // Save and notify parent
      saveCharacter(heroToImport);
      onImport(heroToImport);
      handleOpenChange(false);
    }
  };

  // Trigger file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Format subclass for display
  const formatSubclass = (subclass: string): string => {
    return subclass
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="import-dialog max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[var(--accent-primary)]" />
            Import Character
          </DialogTitle>
          <DialogDescription>
            Select a character JSON file to import.
          </DialogDescription>
        </DialogHeader>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="import-content min-h-[200px] flex flex-col justify-center">
          {/* Idle State - File Picker */}
          <AnimatePresence mode="wait">
            {importState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="import-dropzone"
                onClick={openFilePicker}
              >
                <Upload className="w-8 h-8 text-[var(--accent-dim)] mb-2" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Click to select a character file
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  Accepts .json files exported from Mettle
                </span>
              </motion.div>
            )}

            {/* Validating State */}
            {importState === 'validating' && (
              <motion.div
                key="validating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-8"
              >
                <div className="w-6 h-6 border-2 border-[var(--border-dark)] border-t-[var(--accent-primary)] rounded-full animate-spin" />
                <span className="text-[var(--text-secondary)]">Validating character data...</span>
              </motion.div>
            )}

            {/* Valid State - Preview */}
            {importState === 'valid' && parsedHero && (
              <motion.div
                key="valid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 text-[var(--success)] font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  <span>Character Ready to Import</span>
                </div>

                <div className="p-3 bg-[var(--bg-darkest)] border border-[var(--border-dark)] rounded-lg">
                  <div className="font-bold text-[var(--text-primary)]">{parsedHero.name}</div>
                  <div className="text-xs text-[var(--text-secondary)] capitalize">
                    Level {parsedHero.level} {parsedHero.heroClass}
                    {parsedHero.subclass && ` • ${formatSubclass(parsedHero.subclass)}`}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-[var(--text-muted)]">
                    <span>HP: {parsedHero.stamina.max}</span>
                    <span>Recoveries: {parsedHero.recoveries.max}</span>
                  </div>
                </div>

                {/* Warnings */}
                {validation?.warnings && validation.warnings.length > 0 && (
                  <div className="p-2 bg-[rgba(255,152,0,0.1)] border border-[var(--warning)] rounded">
                    {validation.warnings.map((warning, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-[var(--warning)]">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Name Conflict Warning */}
                {nameConflict && (
                  <div className="p-2 bg-[rgba(255,152,0,0.1)] border border-[var(--warning)] rounded">
                    <div className="flex items-start gap-1.5 text-xs text-[var(--warning)]">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>
                        A character named "{parsedHero.name}" already exists.
                        The imported character will be renamed to "{parsedHero.name} (Imported)".
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openFilePicker}
                  className="self-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Choose Different File
                </Button>
              </motion.div>
            )}

            {/* Invalid State - Errors */}
            {importState === 'invalid' && validation && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 text-[var(--danger)] font-semibold">
                  <X className="w-5 h-5" />
                  <span>Invalid Character File</span>
                </div>

                <div className="p-2 bg-[rgba(239,68,68,0.1)] border border-[var(--danger)] rounded">
                  {validation.errors.map((error, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-[var(--danger)]">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={openFilePicker}
                  className="self-start"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Try Another File
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirmImport}
            disabled={importState !== 'valid' || !parsedHero}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Character
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCharacterDialog;

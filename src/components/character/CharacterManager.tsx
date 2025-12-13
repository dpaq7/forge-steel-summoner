import React, { useState, useRef } from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { Hero, isSummonerHero } from '../../types/hero';
import { classDefinitions } from '../../data/classes/class-definitions';
import {
  getAllCharacters,
  deleteCharacter,
  exportCharacterToJSON,
  importCharacterFromJSON,
  StoredCharacter,
} from '../../utils/storage';
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
}

const CharacterManager: React.FC<CharacterManagerProps> = ({ onClose, onCreateNew }) => {
  const { hero, loadHero, setHero } = useSummonerContext();
  const [characters, setCharacters] = useState<StoredCharacter[]>(getAllCharacters());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshCharacters = () => {
    setCharacters(getAllCharacters());
  };

  const handleLoadCharacter = (id: string) => {
    loadHero(id);
    onClose();
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
    const json = exportCharacterToJSON(character.data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name.replace(/\s+/g, '_')}_level_${character.level}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      const imported = importCharacterFromJSON(json);

      if (imported) {
        loadHero(imported.id);
        refreshCharacters();
        onClose();
      } else {
        alert('Failed to import character. Invalid file format.');
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

  return (
    <div className="character-manager-overlay" onClick={onClose}>
      <div className="character-manager" onClick={(e) => e.stopPropagation()}>
        <div className="manager-header">
          <h2>Character Management</h2>
          <button className="close-manager" onClick={onClose}>×</button>
        </div>

        <div className="manager-actions">
          <button onClick={onCreateNew} className="create-new-btn">
            ✨ Create New Character
          </button>
          <button onClick={handleImportClick} className="import-btn">
            📥 Import Character
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        <div className="characters-list">
          {characters.length === 0 ? (
            <div className="no-characters">
              <p>No characters found</p>
              <p className="hint">Create a new character to get started!</p>
            </div>
          ) : (
            characters.map((character) => (
              <div
                key={character.id}
                className={`character-item ${hero?.id === character.id ? 'active' : ''}`}
              >
                <div className="character-info">
                  <div className="character-name-row">
                    <h3>{character.name}</h3>
                    {hero?.id === character.id && <span className="active-badge">Active</span>}
                  </div>
                  <div className="character-details">
                    <span className="detail">Level {character.level} {getHeroDisplayInfo(character.data).class}</span>
                    <span className="detail">{getHeroDisplayInfo(character.data).subinfo}</span>
                  </div>
                  <div className="character-meta">
                    <span className="last-modified">
                      Last modified: {formatDate(character.lastModified)}
                    </span>
                  </div>
                </div>

                <div className="character-actions">
                  {hero?.id !== character.id && (
                    <button
                      onClick={() => handleLoadCharacter(character.id)}
                      className="load-btn"
                    >
                      Load
                    </button>
                  )}

                  <button
                    onClick={() => handleExportCharacter(character)}
                    className="export-btn"
                    title="Export to JSON"
                  >
                    📤 Export
                  </button>

                  {deleteConfirm === character.id ? (
                    <div className="delete-confirm">
                      <span>Delete?</span>
                      <button
                        onClick={() => handleDeleteCharacter(character.id)}
                        className="confirm-delete-btn"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="cancel-delete-btn"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(character.id)}
                      className="delete-btn"
                      title="Delete character"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="manager-footer">
          <p className="character-count">
            {characters.length} {characters.length === 1 ? 'character' : 'characters'} saved
          </p>
        </div>
      </div>
    </div>
  );
};

export default CharacterManager;

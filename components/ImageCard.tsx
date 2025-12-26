
import React, { useState } from 'react';
import { GeneratedImage } from '../types';

interface ImageCardProps {
  image: GeneratedImage;
  onEdit: (id: string, editPrompt: string) => Promise<void>;
  isEditing: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onEdit, isEditing }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `lumina-ai-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim() || isEditing) return;
    await onEdit(image.id, editPrompt);
    setEditPrompt('');
    setShowEdit(false);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl glass-dark border border-white/10 animate-fade-in flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-black/20">
        <img
          src={image.url}
          alt={image.prompt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay for actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          <button
            onClick={() => setShowEdit(!showEdit)}
            className="p-3 bg-neon-blue/20 rounded-full border border-neon-blue/50 text-neon-blue hover:bg-neon-blue/40 transition-colors"
            title="Edit this image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDownload}
            className="p-3 bg-neon-purple/20 rounded-full border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/40 transition-colors"
            title="Download image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <p className="text-sm text-gray-400 line-clamp-2 mb-4 italic">
          "{image.prompt}"
        </p>

        {showEdit && (
          <form onSubmit={handleEditSubmit} className="mt-auto space-y-2 animate-fade-in">
            <input
              type="text"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="E.g., 'Make it sunset style'"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-blue transition-colors"
            />
            <button
              type="submit"
              disabled={isEditing}
              className="w-full py-2 bg-neon-blue text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              {isEditing ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Editing...
                </>
              ) : (
                'Apply Magic Edit'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

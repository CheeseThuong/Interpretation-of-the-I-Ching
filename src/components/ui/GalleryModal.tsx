import React, { useState, useEffect } from 'react';
import type { GalleryProject } from '../../types';

interface GalleryModalProps {
  project: GalleryProject | null;
  onClose: () => void;
}

// ── Fallback Motifs ───────────────────────────────────────────────────────────
const FallbackMotif: React.FC<{ title: string }> = ({ title }) => {
  if (title === 'AI Oracle Reading') {
    return (
      <svg className="fallback-motif" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="50" cy="50" r="40" strokeDasharray="2 4" opacity="0.2" />
        <path d="M35 38H65M35 46H48M52 46H65M35 54H65M35 62H48M52 62H65" strokeWidth="2.5" />
        <text x="50" y="55" fontSize="14" fill="currentColor" textAnchor="middle" opacity="0.4" style={{fontFamily: 'serif'}}>易</text>
      </svg>
    );
  }
  if (title === 'Manual Coin Casting') {
    return (
      <svg className="fallback-motif" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="32" cy="42" r="10" />
        <circle cx="50" cy="42" r="10" />
        <circle cx="68" cy="42" r="10" />
        <path d="M35 65H65M35 72H48M52 72H65M35 79H65" strokeWidth="2" opacity="0.5" />
      </svg>
    );
  }
  if (title === 'Decision Randomizer') {
    return (
      <svg className="fallback-motif" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="50" cy="50" r="32" strokeDasharray="4 4" opacity="0.3" />
        <path d="M50 18 L50 35 M50 65 L50 82 M18 50 L35 50 M65 50 L82 50" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="5" fill="currentColor" opacity="0.6" />
        <path d="M35 35 L44 44 M56 56 L65 65" strokeWidth="1" strokeDasharray="3 3" />
      </svg>
    );
  }
  return (
    <svg className="fallback-motif" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="50" cy="50" r="30" strokeDasharray="4 4" opacity="0.2" />
      <circle cx="50" cy="50" r="18" opacity="0.4" />
      <path d="M42 50H58M50 42V58" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
};

// ── Isolated image sub-component ──────────────────────────────────────────────
interface ModalImageProps {
  src: string;
  alt: string;
  title: string;
}

const ModalImage: React.FC<ModalImageProps> = ({ src, alt, title }) => {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`image-loader modal-image-wrap${loaded || hasError ? ' loaded' : ''}`}>
      {!hasError ? (
        <img
          id="modalImage"
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : (
        <FallbackMotif title={title} />
      )}
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────
const GalleryModal: React.FC<GalleryModalProps> = ({ project, onClose }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (project) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [project]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className={`modal-backdrop${project ? ' open' : ''}`}
      id="modalBackdrop"
      aria-hidden={!project}
      onClick={(e) => { if ((e.target as HTMLElement).id === 'modalBackdrop') onClose(); }}
    >
      {project && (
        <div className="modal" role="dialog" aria-modal aria-labelledby="modalTitle">
          <button className="modal-close" id="modalClose" aria-label="Đóng modal" onClick={onClose}>
            ×
          </button>
          {/* key=project.image ensures ModalImage remounts (and resets its state)
              every time a different project is opened — no setState-in-effect needed */}
          <ModalImage key={project.image} src={project.image} alt={project.alt} title={project.title} />
          <div className="modal-content">
            <span className="data-badge" id="modalTag">{project.tag}</span>
            <h3 id="modalTitle">{project.title}</h3>
            <p id="modalDescription">{project.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryModal;

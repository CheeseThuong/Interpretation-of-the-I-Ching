import React, { useState, useEffect } from 'react';
import type { GalleryProject } from '../../types';

interface GalleryModalProps {
  project: GalleryProject | null;
  onClose: () => void;
}

// ── Isolated image sub-component so its state resets via `key` ───────────────
// This avoids calling setState directly inside a useEffect body (ESLint: react-hooks/set-state-in-effect).
interface ModalImageProps {
  src: string;
  alt: string;
}

const ModalImage: React.FC<ModalImageProps> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`image-loader modal-image-wrap${loaded ? ' loaded' : ''}`}>
      <img
        id="modalImage"
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
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
          <ModalImage key={project.image} src={project.image} alt={project.alt} />
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

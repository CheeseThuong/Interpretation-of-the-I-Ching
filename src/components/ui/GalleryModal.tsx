import React, { useState, useEffect } from 'react';
import type { GalleryProject } from '../../types';

interface GalleryModalProps {
  project: GalleryProject | null;
  onClose: () => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ project, onClose }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    if (project) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [project]);

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
          <div className={`image-loader modal-image-wrap${imgLoaded ? ' loaded' : ''}`}>
            <img
              id="modalImage"
              src={project.image}
              alt={project.alt}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
            />
          </div>
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

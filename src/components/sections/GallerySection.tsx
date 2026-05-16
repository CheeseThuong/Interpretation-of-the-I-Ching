import React, { useState, useRef, useCallback } from 'react';
import type { GalleryProject } from '../../types';
import { galleryProjects } from '../../data/shared';
import GalleryModal from '../ui/GalleryModal';

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
  if (title.includes('Tarot')) {
    return (
      <svg className="fallback-motif" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="35" y="25" width="30" height="50" rx="2" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="8" strokeDasharray="2 2" />
        <path d="M45 40 L55 60 M55 40 L45 60" strokeWidth="1" opacity="0.4" />
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

// ── Project card ───────────────────────────────────────────────────────────────
interface ProjectCardProps {
  project: GalleryProject;
  onClick: (project: GalleryProject) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <button
      type="button"
      className="project-card"
      onClick={() => onClick(project)}
    >
      <div className={`project-image image-loader${imgLoaded || hasError ? ' loaded' : ''}`}>
        {!hasError ? (
          <img
            src={project.image}
            alt={project.alt}
            loading="lazy"
            draggable={false}
            onLoad={() => setImgLoaded(true)}
            onError={() => setHasError(true)}
          />
        ) : (
          <FallbackMotif title={project.title} />
        )}
        <div className="project-overlay">
          <div>
            <span className="data-badge">{project.tag}</span>
            <h3>{project.title}</h3>
          </div>
        </div>
      </div>
      <div className="project-body">
        <span className="data-badge">{project.tag}</span>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </div>
    </button>
  );
};

// ── Gallery section ────────────────────────────────────────────────────────────
const GallerySection: React.FC = () => {
  const [activeProject, setActiveProject] = useState<GalleryProject | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll logic
  const drag = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    drag.current = { isDown: true, startX: e.pageX - track.offsetLeft, scrollLeft: track.scrollLeft, moved: false };
    track.classList.add('dragging');
  }, []);

  const onMouseLeave = useCallback(() => {
    drag.current.isDown = false;
    trackRef.current?.classList.remove('dragging');
  }, []);

  const onMouseUp = useCallback(() => {
    drag.current.isDown = false;
    trackRef.current?.classList.remove('dragging');
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!drag.current.isDown) return;
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    const x = e.pageX - track.offsetLeft;
    const walk = (x - drag.current.startX) * 1.2;
    if (Math.abs(walk) > 6) drag.current.moved = true;
    track.scrollLeft = drag.current.scrollLeft - walk;
  }, []);

  const handleCardClick = useCallback((project: GalleryProject) => {
    if (!drag.current.moved) setActiveProject(project);
  }, []);

  return (
    <section className="section dark-section section-anchor" id="gallery">
      <div className="container">
        <div className="section-title reveal light-title">
          <p className="eyebrow">Hành Trình Khám Phá</p>
          <h2>Khám Phá Các Tính Năng</h2>
          <p>Trải nghiệm hệ sinh thái tâm linh kết hợp giữa trí tuệ cổ xưa và công nghệ AI hiện đại.</p>
        </div>

        <div className="drag-hint reveal">Kéo ngang để khám phá • Bấm để xem chi tiết</div>

        <div
          className="gallery-track reveal"
          id="galleryTrack"
          aria-label="Gallery kéo ngang"
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {galleryProjects.map((project) => (
            <ProjectCard key={project.title} project={project} onClick={handleCardClick} />
          ))}
        </div>
      </div>

      <GalleryModal project={activeProject} onClose={() => setActiveProject(null)} />
    </section>
  );
};

export default GallerySection;

import React, { useState, useRef, useCallback } from 'react';
import type { GalleryProject } from '../../types';
import { galleryProjects } from '../../data/shared';
import GalleryModal from '../ui/GalleryModal';

// ── Project card ───────────────────────────────────────────────────────────────
interface ProjectCardProps {
  project: GalleryProject;
  onClick: (project: GalleryProject) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <button
      type="button"
      className="project-card"
      onClick={() => onClick(project)}
    >
      <div className={`project-image image-loader${imgLoaded ? ' loaded' : ''}`}>
        <img
          src={project.image}
          alt={project.alt}
          loading="lazy"
          draggable={false}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
        />
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
    <section className="section white-section section-anchor" id="gallery">
      <div className="container">
        <div className="section-title reveal">
          <p className="eyebrow">Interaction demo</p>
          <h2>Gallery có drag-to-scroll, hover overlay và modal</h2>
          <p>Kéo ngang bằng chuột trên desktop hoặc vuốt trên mobile. Hover vào card để thấy ảnh zoom nhẹ và overlay hiện tên dự án.</p>
        </div>

        <div className="drag-hint reveal">🖱️ Kéo ngang gallery, bấm vào card để mở modal chi tiết.</div>

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

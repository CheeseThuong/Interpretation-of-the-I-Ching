import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { GalleryProject } from '../../types';
import { galleryProjects } from '../../data/shared';
import GalleryModal from '../ui/GalleryModal';
import GalleryFallbackMotif from '../ui/GalleryFallbackMotif';

const badgeClasses =
  'inline-flex items-center rounded-full bg-accent px-2.5 py-1.5 text-[0.75rem] font-black text-gold-soft';

// Shimmer placeholder shown behind the image while it loads (before/loaded state).
const imageLoaderClasses = (loaded: boolean) =>
  !loaded &&
  "before:absolute before:inset-0 before:z-[1] before:animate-[shimmer_1.3s_linear_infinite] before:[background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.05),rgba(255,255,255,0)),var(--bg-card-soft)] before:[background-size:220%_100%] before:content-['']";

// ── Project card ───────────────────────────────────────────────────────────────
interface ProjectCardProps {
  project: GalleryProject;
  onClick: (project: GalleryProject) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const loaded = imgLoaded || hasError;

  return (
    <button
      type="button"
      onClick={() => onClick(project)}
      className="group flex-[0_0_360px] overflow-hidden rounded-[28px] border border-border bg-card text-left shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-[220ms] ease-out hover:-translate-y-1.5 hover:border-[var(--border-gold)] hover:shadow-[var(--shadow-soft)] max-[760px]:flex-[0_0_82vw]"
    >
      <div
        className={cn(
          'relative flex h-[250px] items-center justify-center overflow-hidden bg-card-soft text-[var(--gold-muted)]',
          imageLoaderClasses(loaded),
        )}
      >
        {!hasError ? (
          <img
            src={project.image}
            alt={project.alt}
            loading="lazy"
            draggable={false}
            onLoad={() => setImgLoaded(true)}
            onError={() => setHasError(true)}
            className="relative z-[2] h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <GalleryFallbackMotif title={project.title} />
        )}
        <div className="absolute inset-0 z-[3] flex items-end p-[22px] opacity-0 transition-[background,opacity] duration-200 ease-out group-hover:bg-black/66 group-hover:opacity-100">
          <div>
            <span className={badgeClasses}>{project.tag}</span>
            <h3 className="m-0 text-[1.55rem] text-foreground">{project.title}</h3>
          </div>
        </div>
      </div>
      <div className="p-5">
        <span className={badgeClasses}>{project.tag}</span>
        <h3 className="mt-1.5 mb-2 text-[1.1rem] text-foreground">{project.title}</h3>
        <p className="m-0 text-[0.93rem] leading-[1.7] text-[var(--text-secondary)]">{project.description}</p>
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
    <section id="gallery" className="section-anchor bg-[var(--bg-section)] py-[88px] text-foreground">
      <div className="mx-auto w-[min(var(--container),calc(100%-32px))]">
        <div className="reveal mx-auto mb-11 max-w-[780px] text-center">
          <p className="mb-2.5 text-[0.78rem] font-black uppercase tracking-[0.22em] text-gold">
            Hành Trình Khám Phá
          </p>
          <h2 className="m-0 font-heading text-[clamp(2.1rem,4vw,3.2rem)] leading-[1.05] tracking-[-0.055em] text-foreground">
            Khám Phá Các Tính Năng
          </h2>
          <p className="mx-auto mt-4 leading-[1.8] text-muted-foreground">
            Trải nghiệm hệ sinh thái tâm linh kết hợp giữa trí tuệ cổ xưa và công nghệ AI hiện đại.
          </p>
        </div>

        <div className="reveal mb-[22px] inline-flex rounded-[22px] border border-white/8 bg-white/6 px-[18px] py-3 text-[0.88rem] font-bold text-[var(--text-secondary)]">
          Kéo ngang để khám phá • Bấm để xem chi tiết
        </div>

        <div
          className="reveal flex cursor-grab select-none gap-5 overflow-x-auto px-1 pt-1 pb-[22px] [scrollbar-width:none] [&.dragging]:cursor-grabbing [&::-webkit-scrollbar]:hidden"
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

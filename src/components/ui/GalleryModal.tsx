import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { GalleryProject } from '../../types';
import GalleryFallbackMotif from './GalleryFallbackMotif';

interface GalleryModalProps {
  project: GalleryProject | null;
  onClose: () => void;
}

const badgeClasses =
  'inline-flex items-center rounded-full bg-accent px-2.5 py-1.5 text-[0.75rem] font-black text-gold-soft';

// Shimmer placeholder shown behind the image while it loads (before/loaded state).
const imageLoaderClasses = (loaded: boolean) =>
  !loaded &&
  "before:absolute before:inset-0 before:z-[1] before:animate-[shimmer_1.3s_linear_infinite] before:[background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.05),rgba(255,255,255,0)),var(--bg-card-soft)] before:[background-size:220%_100%] before:content-['']";

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
    <div
      className={cn(
        'relative flex h-[310px] items-center justify-center overflow-hidden bg-card-soft text-[var(--gold-muted)]',
        imageLoaderClasses(loaded || hasError),
      )}
    >
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
          className="relative z-[2] h-full w-full object-cover"
        />
      ) : (
        <GalleryFallbackMotif title={title} />
      )}
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────
const GalleryModal: React.FC<GalleryModalProps> = ({ project, onClose }) => {
  // Keep showing the last opened project's content while the dialog plays its
  // close animation — `project` itself flips to null immediately on close.
  // (Adjusting state during render, not in an effect — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  const [displayProject, setDisplayProject] = useState<GalleryProject | null>(project);
  if (project && project !== displayProject) {
    setDisplayProject(project);
  }

  return (
    <Dialog open={!!project} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="gap-0 overflow-hidden rounded-[32px] border border-border bg-card p-0 text-foreground shadow-[0_32px_90px_rgba(0,0,0,0.6)] sm:max-w-[760px]">
        {displayProject && (
          <>
            {/* key=image ensures ModalImage remounts (and resets its state)
                every time a different project is opened — no setState-in-effect needed */}
            <ModalImage key={displayProject.image} src={displayProject.image} alt={displayProject.alt} title={displayProject.title} />
            <DialogHeader className="gap-0 p-[26px] text-left">
              <span className={badgeClasses}>{displayProject.tag}</span>
              <DialogTitle className="mt-[13px] mb-2.5 font-heading text-[2rem] leading-tight font-normal text-foreground">
                {displayProject.title}
              </DialogTitle>
              <DialogDescription className="m-0 text-[1rem] leading-[1.75] text-[var(--text-secondary)]">
                {displayProject.description}
              </DialogDescription>
            </DialogHeader>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GalleryModal;

import React from 'react';

// ── Fallback Motifs ───────────────────────────────────────────────────────────
// Shown in place of a project image when it fails to load. Shared between
// GallerySection's cards and GalleryModal's enlarged view.
interface GalleryFallbackMotifProps {
  title: string;
}

const GalleryFallbackMotif: React.FC<GalleryFallbackMotifProps> = ({ title }) => {
  if (title === 'AI Oracle Reading') {
    return (
      <svg className="h-16 w-16 opacity-60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="50" cy="50" r="40" strokeDasharray="2 4" opacity="0.2" />
        <path d="M35 38H65M35 46H48M52 46H65M35 54H65M35 62H48M52 62H65" strokeWidth="2.5" />
        <text x="50" y="55" fontSize="14" fill="currentColor" textAnchor="middle" opacity="0.4" style={{ fontFamily: 'serif' }}>易</text>
      </svg>
    );
  }
  if (title === 'Manual Coin Casting') {
    return (
      <svg className="h-16 w-16 opacity-60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="32" cy="42" r="10" />
        <circle cx="50" cy="42" r="10" />
        <circle cx="68" cy="42" r="10" />
        <path d="M35 65H65M35 72H48M52 72H65M35 79H65" strokeWidth="2" opacity="0.5" />
      </svg>
    );
  }
  if (title === 'Decision Randomizer') {
    return (
      <svg className="h-16 w-16 opacity-60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="50" cy="50" r="32" strokeDasharray="4 4" opacity="0.3" />
        <path d="M50 18 L50 35 M50 65 L50 82 M18 50 L35 50 M65 50 L82 50" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="5" fill="currentColor" opacity="0.6" />
        <path d="M35 35 L44 44 M56 56 L65 65" strokeWidth="1" strokeDasharray="3 3" />
      </svg>
    );
  }
  if (title.includes('Tarot')) {
    return (
      <svg className="h-16 w-16 opacity-60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="35" y="25" width="30" height="50" rx="2" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="8" strokeDasharray="2 2" />
        <path d="M45 40 L55 60 M55 40 L45 60" strokeWidth="1" opacity="0.4" />
      </svg>
    );
  }
  return (
    <svg className="h-16 w-16 opacity-60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="50" cy="50" r="30" strokeDasharray="4 4" opacity="0.2" />
      <circle cx="50" cy="50" r="18" opacity="0.4" />
      <path d="M42 50H58M50 42V58" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
};

export default GalleryFallbackMotif;

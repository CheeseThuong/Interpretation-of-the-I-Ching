import { useEffect, useRef } from 'react';

/**
 * Applies scroll-reveal animation to elements with class "reveal".
 * Adds "visible" class when element enters the viewport.
 */
export function useScrollReveal() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('.reveal');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  });

  return ref;
}

/**
 * Active navigation link tracking via IntersectionObserver.
 * Marks nav links whose href matches the most visible section.
 */
export function useActiveNav() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('.section-anchor');
    const links = document.querySelectorAll<HTMLElement>('.nav-link, .mobile-nav-link');

    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!active) return;
        const id = active.target.id;
        links.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.25, 0.5] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  });
}

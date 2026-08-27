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

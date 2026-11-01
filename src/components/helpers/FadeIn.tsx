"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const Resumed = createContext(false);

/**
 * After a live update the page should look like it never left, so everything on
 * screen for the first render starts visible. Slides opened later still fade in.
 */
export function ResumeBoundary({ resumed, children }: { resumed: boolean; children: ReactNode }) {
  const [active, setActive] = useState(resumed);
  useEffect(() => {
    const id = setTimeout(() => setActive(false));
    return () => clearTimeout(id);
  }, []);
  return <Resumed.Provider value={active}>{children}</Resumed.Provider>;
}

export default function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(useContext(Resumed));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`print:opacity-100 print:translate-y-0 transition-all duration-[1.2s] ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 fade-wait"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

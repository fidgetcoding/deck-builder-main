'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { brand } from '@/lib/brand';

type Props = { open: boolean; onClose: () => void };

export function ContactModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  // Portal: the deck top bar uses backdrop-blur, which would trap a fixed child.
  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={`Book a call with ${brand.name}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[720px] mx-4 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-raised)] p-6"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-foreground-secondary hover:text-foreground transition-colors text-2xl leading-none"
        >
          ×
        </button>
        <h2 className="mb-4 text-xl text-brand-green-light">Book a call</h2>
        <iframe
          src={brand.bookingUrl}
          title={`Book a call with ${brand.name}`}
          width="100%"
          height={640}
          style={{ border: 0, borderRadius: 8 }}
          allow="fullscreen"
          loading="lazy"
        />
        <p className="mt-3 text-sm text-foreground-secondary">
          Trouble loading?{' '}
          <a
            href={brand.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-green-light underline"
          >
            Open in a new tab →
          </a>
        </p>
      </div>
    </div>,
    document.body,
  );
}

export default ContactModal;

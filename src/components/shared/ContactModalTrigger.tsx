'use client';
import { useState, type ReactNode } from 'react';
import { useBrand } from '@/components/BrandContext';
import { ContactModal } from './ContactModal';

type Props = { className?: string; children?: ReactNode };

export function ContactModalTrigger({ className, children = 'CONTACT' }: Props) {
  const brand = useBrand();
  const [open, setOpen] = useState(false);
  if (!brand.bookingUrl) {
    return (
      <a href={`mailto:${brand.contactEmail}`} className={className}>
        {children}
      </a>
    );
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <ContactModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default ContactModalTrigger;

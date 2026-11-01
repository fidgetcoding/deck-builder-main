'use client';
import { useState, type ReactNode } from 'react';
import { ContactModal } from './ContactModal';

type Props = { className?: string; children?: ReactNode };

export function ContactModalTrigger({ className, children = 'CONTACT' }: Props) {
  const [open, setOpen] = useState(false);
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

'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// T1.3 (F1, Página Contact) — formulario cliente, POST directo (AJAX
// estándar de Formspree, sin la librería `@formspree/react`: no está
// instalada y no hace falta para 3 campos) al endpoint del plan gratuito.
//
// Endpoint real (claim de Formspree completado por el usuario,
// action.email=info@endurofun.eu) — el envío end-to-end contra este
// endpoint real lo comprueba el verifier, no la suite e2e permanente (esa
// intercepta la llamada con `page.route()`, regla 10 del planning).
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mykrjbra';

// PRD §9.2 ([verificar] límite del plan gratuito de Formspree): el plan
// gratuito de Formspree admite un número limitado de submissions al mes (50
// en el momento de escribir esto, ver https://formspree.io/plans). Si se
// supera, Formspree deja de aceptar nuevos envíos hasta el siguiente ciclo
// mensual — el formulario seguiría mostrando el estado de error definido
// abajo (fetch no-ok), no hay lógica adicional que gestionar aquí; es
// informativo para quien opere el sitio, no bloquea esta tarea.

interface ContactFormLabels {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  successMessage: string;
  errorMessage: string;
}

interface ContactFormProps {
  labels: ContactFormLabels;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm({ labels }: ContactFormProps) {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('submitting');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return <p className="text-body text-text-primary">{labels.successMessage}</p>;
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <div className="mb-5">
        <label
          htmlFor="contact-name"
          className="font-display mb-2 block text-small font-semibold text-text-primary"
        >
          {labels.nameLabel}
        </label>
        <Input
          id="contact-name"
          name="name"
          type="text"
          placeholder={labels.namePlaceholder}
          required
        />
      </div>
      <div className="mb-5">
        <label
          htmlFor="contact-email"
          className="font-display mb-2 block text-small font-semibold text-text-primary"
        >
          {labels.emailLabel}
        </label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          placeholder={labels.emailPlaceholder}
          required
        />
      </div>
      <div className="mb-5">
        <label
          htmlFor="contact-message"
          className="font-display mb-2 block text-small font-semibold text-text-primary"
        >
          {labels.messageLabel}
        </label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder={labels.messagePlaceholder}
          required
        />
      </div>
      <Button type="submit" variant="primary" disabled={status === 'submitting'}>
        {labels.submitLabel}
      </Button>
      {status === 'error' ? (
        <p className="mt-4 text-small text-danger">{labels.errorMessage}</p>
      ) : null}
    </form>
  );
}

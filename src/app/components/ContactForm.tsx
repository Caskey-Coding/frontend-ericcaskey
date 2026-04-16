'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  function getString(data: FormData, key: string): string {
    const v = data.get(key);
    return typeof v === 'string' ? v.trim() : '';
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if (getString(data, 'company')) {
      // Honeypot tripped — drop silently.
      setStatus('idle');
      return;
    }

    const name = getString(data, 'name');
    const email = getString(data, 'email');
    const message = getString(data, 'message');

    if (!name || !email || message.length < 10 || message.length > 2000) {
      setStatus('error');
      return;
    }

    const subject = `Inquiry from ${name}`;
    const body = `${message}\n\n— ${name} (${email})`;
    const mailto = `mailto:eric@caskeycoding.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6" noValidate>
      <label className="flex flex-col gap-1 text-sm">
        <span style={{ color: 'var(--color-text-secondary)' }}>Your name</span>
        <input
          name="name"
          type="text"
          required
          placeholder="Full name"
          className="border px-3 py-2 bg-transparent min-h-11"
          style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span style={{ color: 'var(--color-text-secondary)' }}>Email</span>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="border px-3 py-2 bg-transparent min-h-11"
          style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span style={{ color: 'var(--color-text-secondary)' }}>
          What&apos;s this about?
        </span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          placeholder="Role, project, or inquiry"
          className="border px-3 py-2 bg-transparent resize-y"
          style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
        />
      </label>

      {/* Honeypot — visually hidden, real users won't fill it */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button type="submit" className="btn-primary self-start">
        Send message
      </button>

      {status === 'error' ? (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          That did not go through. Try again, or email me directly at the
          address below.
        </p>
      ) : null}

      {/*
        Server Action stub — uncomment when SES vs Resend decision lands
        (spec 003 OQ-3). The mailto: above is the v1 fallback.

        import { sendContactMessage } from './actions';
        const result = await sendContactMessage({ name, email, message });
      */}
    </form>
  );
}

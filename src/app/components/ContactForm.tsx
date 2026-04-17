'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error';

const API_URL = process.env.NEXT_PUBLIC_CONTACT_API_URL ?? '';

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

    setStatus('sending');

    fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        setStatus('success');
        form.reset();
      })
      .catch(() => {
        setStatus('error');
      });
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

      <button
        type="submit"
        className="btn-primary self-start"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Sending\u2026' : 'Send message'}
      </button>

      {status === 'success' && (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Message sent. I&apos;ll get back to you soon.
        </p>
      )}

      {status === 'error' && (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          That did not go through. Try again, or email me directly at the
          address below.
        </p>
      )}
    </form>
  );
}

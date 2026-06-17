'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'invalid' | 'error';

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

    // Client validation failure is distinct from a send failure: tell the
    // user what to fix rather than implying the message bounced.
    if (!name || !email || message.length < 10 || message.length > 2000) {
      setStatus('invalid');
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
        <span className="text-muted font-medium">Your name</span>
        <input
          name="name"
          type="text"
          required
          placeholder="Full name"
          className="field-input"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="field-input"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted font-medium">
          What&apos;s this about?
        </span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          placeholder="Role, project, or inquiry"
          className="field-input"
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

      {/* Status region: announced to assistive tech (aria-live), with errors
          raised as alerts. Success and the two failure kinds are distinct,
          and color reinforces the distinction: accent for success, danger
          for both failure kinds. */}
      <div aria-live="polite" className="text-sm">
        {status === 'success' && (
          <p className="form-note form-note--ok">
            Message sent. I&apos;ll get back to you soon.
          </p>
        )}

        {status === 'invalid' && (
          <p role="alert" className="form-note form-note--err">
            Please add your name, a valid email, and a message between 10 and
            2000 characters.
          </p>
        )}

        {status === 'error' && (
          <p role="alert" className="form-note form-note--err">
            That did not go through. Try again, or email me directly at the
            address below.
          </p>
        )}
      </div>
    </form>
  );
}

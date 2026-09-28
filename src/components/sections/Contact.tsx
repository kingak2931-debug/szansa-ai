"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { foundationLegal } from "../../lib/legal";
import { useCookie } from "../providers/CookieProvider";
import { useLanguage } from "../providers/LanguageProvider";

type FormState = {
  name: string;
  email: string;
  role: string;
  message: string;
  rodo: boolean;
};

const initial: FormState = {
  name: "",
  email: "",
  role: "",
  message: "",
  rodo: false,
};

export function Contact() {
  const { t } = useLanguage();
  const { openPrivacy } = useCookie();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = t.contact.required;
    if (!form.email.trim()) next.email = t.contact.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = t.contact.invalidEmail;
    }
    if (!form.role) next.role = t.contact.required;
    if (!form.message.trim()) next.message = t.contact.required;
    if (!form.rodo) next.rodo = t.contact.rodoRequired;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");

    // Client-side mailto fallback until a form backend is connected
    try {
      const subject = encodeURIComponent(
        `[Szansa AI] ${form.role} — ${form.name}`,
      );
      const body = encodeURIComponent(
        `${form.message}\n\n---\n${form.name}\n${form.email}\n${form.role}`,
      );
      window.location.href = `mailto:${foundationLegal.email}?subject=${subject}&body=${body}`;
      setStatus("success");
      setForm(initial);
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className="contact-section"
      aria-labelledby="contact-title"
    >
      <div className="section-intro">
        <p className="eyebrow">{t.contact.eyebrow}</p>
        <h2 id="contact-title">{t.contact.title}</h2>
        <p className="section-lead">{t.contact.lead}</p>
      </div>

      <form className="contact-form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="contact-name">{t.contact.name}</label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "err-name" : undefined}
          />
          {errors.name && (
            <p id="err-name" className="field-error" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="contact-email">{t.contact.email}</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "err-email" : undefined}
          />
          {errors.email && (
            <p id="err-email" className="field-error" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="contact-role">{t.contact.role}</label>
          <select
            id="contact-role"
            name="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            aria-invalid={!!errors.role}
            aria-describedby={errors.role ? "err-role" : undefined}
          >
            {t.contact.roleOptions.map((opt) => (
              <option key={opt.value || "empty"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p id="err-role" className="field-error" role="alert">
              {errors.role}
            </p>
          )}
        </div>

        <div className="field field-full">
          <label htmlFor="contact-message">{t.contact.message}</label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "err-message" : undefined}
          />
          {errors.message && (
            <p id="err-message" className="field-error" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        <div className="field field-full checkbox-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.rodo}
              onChange={(e) => setForm({ ...form, rodo: e.target.checked })}
              aria-invalid={!!errors.rodo}
            />
            <span>
              {t.contact.rodo}{" "}
              <button
                type="button"
                className="linkish"
                onClick={openPrivacy}
              >
                {t.contact.privacyLink}
              </button>
            </span>
          </label>
          {errors.rodo && (
            <p className="field-error" role="alert">
              {errors.rodo}
            </p>
          )}
        </div>

        <div className="form-actions field-full">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === "sending"}
          >
            <Send size={18} aria-hidden />
            {status === "sending" ? t.contact.sending : t.contact.submit}
          </button>
          {status === "success" && (
            <p className="form-success" role="status">
              {t.contact.success}
            </p>
          )}
          {status === "error" && (
            <p className="field-error" role="alert">
              {t.contact.error}{" "}
              <a href={`mailto:${foundationLegal.email}`}>
                {foundationLegal.email}
              </a>
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

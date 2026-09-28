"use client";

import { useState } from "react";
import { Building2, Copy, Check, Smartphone, BarChart3 } from "lucide-react";
import { foundationLegal } from "../../lib/legal";
import { useLanguage } from "../providers/LanguageProvider";

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function Donate() {
  const { t } = useLanguage();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const bank = foundationLegal.bankAccount;

  const onCopy = async (key: string, value: string) => {
    const ok = await copyText(value);
    if (ok) {
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  return (
    <section id="donate" className="donate-section" aria-labelledby="donate-title">
      <div className="section-intro">
        <p className="eyebrow">{t.donate.eyebrow}</p>
        <h2 id="donate-title">{t.donate.title}</h2>
        <p className="section-lead">{t.donate.lead}</p>
      </div>

      <div className="donate-layout">
        <div className="glass-panel bank-panel">
          <div className="glass-head">
            <Building2 aria-hidden size={22} />
            <h3>{t.donate.bankTitle}</h3>
            {bank.isPlaceholder && (
              <span className="badge-placeholder">{t.donate.placeholderBadge}</span>
            )}
          </div>

          <dl className="bank-fields">
            <div>
              <dt>{t.donate.recipient}</dt>
              <dd>
                <span>{bank.recipient}</span>
                <CopyBtn
                  label={t.donate.copy}
                  done={copiedKey === "recipient"}
                  doneLabel={t.donate.copied}
                  onClick={() => onCopy("recipient", bank.recipient)}
                />
              </dd>
            </div>
            <div>
              <dt>{t.donate.account}</dt>
              <dd>
                <span className="mono">{bank.iban}</span>
                <CopyBtn
                  label={t.donate.copy}
                  done={copiedKey === "iban"}
                  doneLabel={t.donate.copied}
                  onClick={() => onCopy("iban", bank.iban)}
                />
              </dd>
            </div>
            <div>
              <dt>{t.donate.bank}</dt>
              <dd>
                <span>{bank.bankName}</span>
              </dd>
            </div>
            <div>
              <dt>{t.donate.titleLabel}</dt>
              <dd>
                <span>{bank.transferTitle}</span>
                <CopyBtn
                  label={t.donate.copy}
                  done={copiedKey === "title"}
                  doneLabel={t.donate.copied}
                  onClick={() => onCopy("title", bank.transferTitle)}
                />
              </dd>
            </div>
          </dl>
          <p className="krs-note">{t.donate.krsNote}</p>
        </div>

        <div className="glass-panel blik-panel">
          <div className="glass-head">
            <Smartphone aria-hidden size={22} />
            <h3>{t.donate.blikTitle}</h3>
            {foundationLegal.blik.isPlaceholder && (
              <span className="badge-placeholder">{t.donate.placeholderBadge}</span>
            )}
          </div>
          <p>{t.donate.blikBody}</p>
          <p className="mono muted">{foundationLegal.blik.phoneLabel}</p>
        </div>
      </div>

      <div className="impact-block">
        <div className="impact-head">
          <BarChart3 aria-hidden size={20} />
          <h3>{t.donate.impactTitle}</h3>
        </div>
        <ul className="impact-stats">
          {t.donate.stats.map((stat) => (
            <li key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CopyBtn({
  label,
  doneLabel,
  done,
  onClick,
}: {
  label: string;
  doneLabel: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="copy-btn"
      onClick={onClick}
      aria-label={done ? doneLabel : label}
    >
      {done ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
      <span>{done ? doneLabel : label}</span>
    </button>
  );
}

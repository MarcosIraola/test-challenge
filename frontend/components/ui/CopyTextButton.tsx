"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  text: string;
  label: string;
};

export default function CopyTextButton({ text, label }: Props) {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    },
    [],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = window.setTimeout(() => {
        copiedTimeoutRef.current = null;
        setCopied(false);
      }, 1500);
    } catch {
      window.prompt("Copy:", text);
    }
  }

  return (
    <button
      type="button"
      className="cell-copy-btn"
      onClick={handleCopy}
      aria-label={label}
      title={label}
    >
      {copied ? (
        <Check size={14} aria-hidden="true" />
      ) : (
        <Copy size={14} aria-hidden="true" />
      )}
    </button>
  );
}

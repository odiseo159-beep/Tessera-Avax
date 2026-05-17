"use client";

interface ToastProps {
  on: boolean;
  msg: string;
}

/// Inline toast pill used by portfolio's copy-address flow. Not a global
/// notification system — for that we still use sonner (mounted in providers).
export function Toast({ on, msg }: ToastProps) {
  return <div className={`toast ${on ? "is-on" : ""}`}>{msg}</div>;
}

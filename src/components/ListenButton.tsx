"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Reads a piece of wisdom aloud using the browser's built-in
 * Web Speech API (SpeechSynthesis). No network, no API keys, works offline.
 *
 * Reads, in order: the Wisdom message → Perspective Shift → Practical Action.
 * Splitting into separate utterances keeps long passages reliable across browsers
 * (some engines truncate very long single utterances).
 */
export default function ListenButton({
  segments,
  title = "Listen to this wisdom",
  subtitle = "Hear the Wisdom, Perspective Shift & Practical Action read aloud.",
}: {
  /** Ordered text segments to narrate, e.g. [wisdom, shift, action]. */
  segments: string[];
  /** Heading shown on the listen bar. */
  title?: string;
  /** Sub-text describing what will be read. */
  subtitle?: string;
}) {
  const [supported, setSupported] = useState(true);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");

  const queueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const idxRef = useRef(0);
  // tracks whether playback has been stopped/cancelled, so onend callbacks
  // (which capture stale state) can bail out reliably.
  const activeRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    // Trigger voice list population in browsers that load voices async.
    window.speechSynthesis.getVoices();
    return () => {
      activeRef.current = false;
      window.speechSynthesis.cancel();
    };
  }, []);

  const buildQueue = useCallback(() => {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const preferred =
      voices.find(
        (v) => /en[-_]?(GB|US)/i.test(v.lang) && /female|samantha|karen|serena|google/i.test(v.name)
      ) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ||
      voices[0];

    const chunks: string[] = [];
    for (const seg of segments) {
      const clean = (seg || "").trim();
      if (!clean) continue;
      const parts = clean.match(/[^.!?]+[.!?]*\s*/g) || [clean];
      let buf = "";
      for (const p of parts) {
        if ((buf + p).length > 220) {
          if (buf) chunks.push(buf.trim());
          buf = p;
        } else {
          buf += p;
        }
      }
      if (buf.trim()) chunks.push(buf.trim());
    }

    return chunks.map((text) => {
      const u = new SpeechSynthesisUtterance(text);
      if (preferred) u.voice = preferred;
      u.rate = 0.92; // contemplative pace
      u.pitch = 1;
      u.volume = 1;
      return u;
    });
  }, [segments]);

  const speakNext = useCallback(() => {
    if (!activeRef.current) return;
    const synth = window.speechSynthesis;
    const q = queueRef.current;
    if (idxRef.current >= q.length) {
      activeRef.current = false;
      idxRef.current = 0;
      setState("idle");
      return;
    }
    const u = q[idxRef.current];
    u.onend = () => {
      if (!activeRef.current) return;
      idxRef.current += 1;
      speakNext();
    };
    u.onerror = () => {
      activeRef.current = false;
      setState("idle");
    };
    synth.speak(u);
  }, []);

  function play() {
    const synth = window.speechSynthesis;
    if (state === "paused") {
      activeRef.current = true;
      synth.resume();
      setState("playing");
      return;
    }
    synth.cancel();
    queueRef.current = buildQueue();
    idxRef.current = 0;
    if (queueRef.current.length === 0) return;
    activeRef.current = true;
    setState("playing");
    speakNext();
  }

  function pause() {
    window.speechSynthesis.pause();
    setState("paused");
  }

  function stop() {
    activeRef.current = false;
    window.speechSynthesis.cancel();
    idxRef.current = 0;
    setState("idle");
  }

  if (!supported) {
    return (
      <div className="listen-bar" role="note">
        <span className="listen-ic" aria-hidden>🔇</span>
        <span style={{ color: "var(--text-dim)", fontSize: ".88rem" }}>
          Voice narration isn’t supported in this browser.
        </span>
      </div>
    );
  }

  return (
    <div className="listen-bar">
      <div className="listen-label">
        <span className={`listen-ic${state === "playing" ? " pulse" : ""}`} aria-hidden>
          {state === "playing" ? "🔊" : "🎧"}
        </span>
        <div>
          <strong style={{ display: "block", color: "var(--parchment)" }}>{title}</strong>
          <span style={{ fontSize: ".82rem", color: "var(--text-dim)" }}>{subtitle}</span>
        </div>
      </div>
      <div className="listen-controls" role="group" aria-label="Narration controls">
        {state !== "playing" ? (
          <button className="btn btn-gold btn-sm" onClick={play} aria-label="Play narration">
            ▶ {state === "paused" ? "Resume" : "Play"}
          </button>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={pause} aria-label="Pause narration">
            ⏸ Pause
          </button>
        )}
        <button
          className="btn btn-ghost btn-sm"
          onClick={stop}
          disabled={state === "idle"}
          aria-label="Stop narration"
        >
          ⏹ Stop
        </button>
      </div>
    </div>
  );
}

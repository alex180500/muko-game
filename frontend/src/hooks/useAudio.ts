import { useEffect, useRef, useState } from "react";

export function useAudio(soundUrls: Record<string, string>) {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const sfxBuffers = useRef<Record<string, AudioBuffer | null>>(
    Object.fromEntries(Object.keys(soundUrls).map((k) => [k, null])),
  );
  const isMutedRef = useRef(false);

  // Pre-decode all audio on mount for zero-latency playback
  useEffect(() => {
    const ctx = new AudioContext();
    audioCtx.current = ctx;
    const load = (url: string, key: string) =>
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((b) => ctx.decodeAudioData(b))
        .then((b) => (sfxBuffers.current[key] = b));
    Object.entries(soundUrls).forEach(([key, url]) => load(url, key));
    return () => {
      ctx.close();
    };
  }, []);

  const playSound = (key: string) => {
    if (isMutedRef.current) return;
    const buf = sfxBuffers.current[key];
    if (!buf || !audioCtx.current) return;
    const src = audioCtx.current.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.current.destination);
    src.start(0);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    isMutedRef.current = next;
  };

  return { playSound, isMuted, toggleMute };
}

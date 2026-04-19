'use client';
import { useState, useRef, useEffect } from 'react';
import { Music, X, Volume2, VolumeX } from 'lucide-react';

export default function MusicPopup() {
  const [show, setShow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
      audioRef.current.play();
      setPlaying(true);
    }
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play();
        setPlaying(true);
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} src="https://files.catbox.moe/dwjqgv.mp3" preload="none" />

      {/* Popup */}
      {show && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />
          <div
            className="relative w-full max-w-mobile rounded-3xl p-6 animate-slide-up"
            style={{
              background: 'linear-gradient(135deg, #111827, #1a2235)',
              border: '1px solid rgba(34,197,94,0.2)',
              boxShadow: '0 -20px 60px rgba(34,197,94,0.1)',
            }}
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #22c55e22, #16a34a44)' }}
              >
                <Music size={24} className="text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">🎵 Musik Latar</h3>
                <p className="text-white/40 text-sm">Malzz Nokos BGM</p>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-5">
              Putar musik latar untuk pengalaman terbaik menggunakan Malzz Nokos?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 h-12 rounded-2xl text-sm font-semibold text-white/60 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Tidak
              </button>
              <button
                onClick={handlePlay}
                className="flex-1 h-12 rounded-2xl text-sm font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  boxShadow: '0 4px 15px rgba(34,197,94,0.3)',
                }}
              >
                ▶ Putar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating music toggle */}
      {!show && !dismissed && (
        <button
          onClick={toggleMute}
          className="fixed bottom-24 right-4 z-40 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            background: playing
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: playing ? '0 0 15px rgba(34,197,94,0.3)' : 'none',
          }}
        >
          {playing
            ? <Volume2 size={16} className="text-white" />
            : <VolumeX size={16} className="text-white/50" />
          }
        </button>
      )}
    </>
  );
}

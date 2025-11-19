import { useEffect, useState } from 'react';

interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
}

/**
 * Animated voice orb - pulses when listening or speaking
 */
export function VoiceOrb({ isListening, isSpeaking }: VoiceOrbProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (isListening || isSpeaking) {
      const interval = setInterval(() => {
        setScale(prev => prev === 1 ? 1.2 : 1);
      }, 600);
      return () => clearInterval(interval);
    } else {
      setScale(1);
    }
  }, [isListening, isSpeaking]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ring - animated */}
      {(isListening || isSpeaking) && (
        <div
          className="absolute w-32 h-32 rounded-full border-4 animate-ping"
          style={{
            borderColor: isListening ? '#8b5cf6' : '#ec4899',
            animationDuration: '1.5s',
            opacity: 0.5
          }}
        />
      )}

      {/* Middle ring */}
      <div
        className="absolute w-28 h-28 rounded-full transition-all duration-300"
        style={{
          transform: `scale(${scale})`,
          background: isListening
            ? 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0.1) 100%)'
            : isSpeaking
            ? 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(236,72,153,0.1) 100%)'
            : 'transparent'
        }}
      />

      {/* Core orb */}
      <div
        className="relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
        style={{
          transform: `scale(${scale})`,
          background: isListening
            ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
            : isSpeaking
            ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
            : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
          boxShadow: isListening || isSpeaking
            ? '0 8px 32px rgba(139, 92, 246, 0.5)'
            : '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Inner glow */}
        <div
          className="w-16 h-16 rounded-full"
          style={{
            background: isListening || isSpeaking
              ? 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)'
              : 'transparent'
          }}
        />
      </div>
    </div>
  );
}

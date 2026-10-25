import React from 'react';
import { QuantumLogo } from './QuantumLogo.tsx';

interface CompanyLogoProps {
  companyId: string;
  size?: number;
  className?: string;
  showContainer?: boolean;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  companyId,
  size = 44,
  className = '',
  showContainer = true
}) => {
  // Render specific SVG emblem for each holding
  const renderEmblem = () => {
    switch (companyId) {
      case 'quantum_initium':
        return <QuantumLogo size={size * 0.85} />;

      case 'immigratiepunt':
        return (
          <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
            <defs>
              <linearGradient id="ipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            {/* Global Latitude Navigation Arc */}
            <circle cx="50" cy="50" r="38" stroke="url(#ipGrad)" strokeWidth="3.5" strokeDasharray="6 4" opacity="0.4" />
            <path d="M20 50 Q50 32 80 50" stroke="url(#ipGrad)" strokeWidth="2.5" fill="none" opacity="0.5" />
            {/* Balanced Scales of Justice */}
            <path d="M50 22 L50 74" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <path d="M28 34 L72 34" stroke="url(#ipGrad)" strokeWidth="4" strokeLinecap="round" />
            {/* Left Pan */}
            <path d="M28 34 L20 52 M28 34 L36 52" stroke="#38bdf8" strokeWidth="2" />
            <path d="M16 52 Q28 60 40 52 Z" fill="url(#ipGrad)" />
            {/* Right Pan */}
            <path d="M72 34 L64 52 M72 34 L80 52" stroke="#38bdf8" strokeWidth="2" />
            <path d="M60 52 Q72 60 84 52 Z" fill="url(#ipGrad)" />
            {/* Pedestal */}
            <rect x="40" y="74" width="20" height="5" rx="2.5" fill="#ffffff" />
            {/* Passport Flight Arrow */}
            <path d="M38 68 Q50 60 76 38" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
            <polygon points="78,35 73,42 70,36" fill="#38bdf8" />
          </svg>
        );

      case 'vvc':
        return (
          <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
            <defs>
              <linearGradient id="vvcGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>
            </defs>
            {/* Laurel Wreath Left */}
            <path d="M24 64 C16 48 22 34 32 25 C30 33 34 40 38 44 C34 48 30 56 34 64" fill="none" stroke="url(#vvcGold)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Laurel Wreath Right */}
            <path d="M76 64 C84 48 78 34 68 25 C70 33 66 40 62 44 C66 48 70 56 66 64" fill="none" stroke="url(#vvcGold)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Regal Heraldic Double-V Monogram */}
            <path d="M30 36 L44 68 L52 48" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M48 48 L56 68 L70 36" stroke="url(#vvcGold)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Syndicate Diamond Crown Apex */}
            <polygon points="50,22 55,28 50,34 45,28" fill="#fef08a" />
            <circle cx="34" cy="27" r="2.5" fill="#fef08a" />
            <circle cx="66" cy="27" r="2.5" fill="#fef08a" />
          </svg>
        );

      case 'investbotiq':
        return (
          <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
            <defs>
              <linearGradient id="ibGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            {/* Candlestick 1 */}
            <line x1="28" y1="36" x2="28" y2="72" stroke="#34d399" strokeWidth="2" />
            <rect x="23" y="44" width="10" height="20" rx="2" fill="#059669" stroke="#34d399" strokeWidth="1.5" />
            {/* Candlestick 2 */}
            <line x1="48" y1="26" x2="48" y2="68" stroke="#34d399" strokeWidth="2" />
            <rect x="43" y="34" width="10" height="24" rx="2" fill="url(#ibGrad)" stroke="#ffffff" strokeWidth="1.5" />
            {/* Candlestick 3 */}
            <line x1="68" y1="20" x2="68" y2="58" stroke="#34d399" strokeWidth="2" />
            <rect x="63" y="24" width="10" height="22" rx="2" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />
            {/* AI Vector Surge Line */}
            <path d="M18 64 L38 52 L56 42 L80 20" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="80" cy="20" r="4.5" fill="#34d399" stroke="#ffffff" strokeWidth="2" />
          </svg>
        );

      case 'spontiva':
        return (
          <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
            <defs>
              <linearGradient id="spGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>
            {/* Sparkling Faceted Champagne Gem */}
            <polygon points="50,18 78,38 68,76 32,76 22,38" fill="url(#spGrad)" opacity="0.3" stroke="#f472b6" strokeWidth="2" />
            <polygon points="50,24 72,40 64,70 36,70 28,40" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="50" y1="24" x2="50" y2="70" stroke="#ffffff" strokeWidth="2" />
            <line x1="28" y1="40" x2="72" y2="40" stroke="#ffffff" strokeWidth="2" />
            {/* Starburst Highlights */}
            <path d="M50 8 L52 14 L58 16 L52 18 L50 24 L48 18 L42 16 L48 14 Z" fill="#ffffff" />
            <circle cx="78" cy="26" r="2.5" fill="#f472b6" />
            <circle cx="22" cy="62" r="2" fill="#ffffff" />
          </svg>
        );

      case 'boostplug':
        return (
          <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
            <defs>
              <linearGradient id="bpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
            {/* Kinetic Acceleration Turbine Arcs */}
            <circle cx="50" cy="50" r="38" stroke="url(#bpGrad)" strokeWidth="3" strokeDasharray="18 10" opacity="0.5" />
            {/* Dynamic Electric Bolt & Power Rocket */}
            <polygon points="56,18 30,52 48,52 42,82 72,44 54,44" fill="url(#bpGrad)" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M22 62 Q30 76 46 80" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case 'zheavenzy':
        return (
          <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
            <defs>
              <linearGradient id="zhGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            {/* Octagonal Luxury Gem Cut Contour */}
            <polygon points="36,18 64,18 82,36 82,64 64,82 36,82 18,64 18,36" fill="none" stroke="url(#zhGrad)" strokeWidth="2.5" opacity="0.6" />
            {/* Couture Interlocking 'Z' Monogram */}
            <path d="M30 34 L68 34 L32 66 L70 66" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="26" y1="50" x2="74" y2="50" stroke="url(#zhGrad)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="50" r="3" fill="#ffffff" />
          </svg>
        );

      case 'logs_rent':
        return (
          <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
            <defs>
              <linearGradient id="lrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
            {/* Isometric Transport Hexagon */}
            <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="url(#lrGrad)" opacity="0.25" stroke="#94a3b8" strokeWidth="2.5" />
            {/* Inner Isometric Cube Lines */}
            <path d="M50 18 L50 50 M22 34 L50 50 M78 34 L50 50 M50 50 L50 82" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            {/* Velocity Compass Ring & Arrow */}
            <circle cx="50" cy="50" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <polygon points="50,42 54,54 50,52 46,54" fill="#38bdf8" />
          </svg>
        );

      case 'crmos':
        return (
          <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
            <defs>
              <linearGradient id="crmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
            {/* Interconnected Cloud Hexagon Nodes */}
            <circle cx="50" cy="26" r="8" fill="url(#crmGrad)" stroke="#ffffff" strokeWidth="2" />
            <circle cx="74" cy="42" r="8" fill="url(#crmGrad)" stroke="#ffffff" strokeWidth="2" />
            <circle cx="74" cy="68" r="8" fill="url(#crmGrad)" stroke="#ffffff" strokeWidth="2" />
            <circle cx="50" cy="78" r="8" fill="url(#crmGrad)" stroke="#ffffff" strokeWidth="2" />
            <circle cx="26" cy="68" r="8" fill="url(#crmGrad)" stroke="#ffffff" strokeWidth="2" />
            <circle cx="26" cy="42" r="8" fill="url(#crmGrad)" stroke="#ffffff" strokeWidth="2" />
            {/* Database Ring Connectors */}
            <path d="M50 26 L74 42 L74 68 L50 78 L26 68 L26 42 Z" stroke="url(#crmGrad)" strokeWidth="3" fill="none" opacity="0.5" />
            {/* Central Synchronized Core */}
            <circle cx="50" cy="50" r="10" fill="#ffffff" />
            <path d="M50 26 L50 50 M74 42 L50 50 M74 68 L50 50 M50 78 L50 50 M26 68 L50 50 M26 42 L50 50" stroke="#ffffff" strokeWidth="2" />
          </svg>
        );

      case 'djobba':
        return (
          <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
            <defs>
              <linearGradient id="djGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            {/* Talent Search Radar Target */}
            <circle cx="50" cy="50" r="36" stroke="url(#djGrad)" strokeWidth="2.5" opacity="0.4" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="24" stroke="url(#djGrad)" strokeWidth="2" opacity="0.6" />
            {/* Executive Talent Beacon Silhouette */}
            <circle cx="50" cy="34" r="9" fill="#ffffff" />
            <path d="M34 68 Q50 48 66 68 Z" fill="url(#djGrad)" stroke="#ffffff" strokeWidth="2" />
            {/* Star of Excellence */}
            <polygon points="50,18 52,23 57,23 53,26 55,31 50,28 45,31 47,26 43,23 48,23" fill="#ffffff" />
          </svg>
        );

      case 'trusting_work':
        return (
          <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
            <defs>
              <linearGradient id="twGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
            </defs>
            {/* Verified Compliance Shield */}
            <path d="M50 18 Q74 22 74 44 C74 66 50 82 50 82 C50 82 26 66 26 44 Q26 22 50 18 Z" fill="url(#twGrad)" stroke="#ffffff" strokeWidth="3" />
            {/* Trust Handshake / Checkmark Ribbon */}
            <path d="M38 48 L46 56 L64 38" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Certified Top Ribbons */}
            <circle cx="50" cy="30" r="3" fill="#2dd4bf" />
          </svg>
        );

      case 'woningvry':
        return (
          <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
            <defs>
              <linearGradient id="wvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
            {/* Modernist Architectural Villa Pavilion */}
            <polygon points="50,18 84,36 16,36" fill="url(#wvGrad)" stroke="#ffffff" strokeWidth="2" />
            <rect x="24" y="38" width="52" height="38" rx="2" fill="none" stroke="url(#wvGrad)" strokeWidth="3" />
            {/* Off-Market Keyhole Arch Portal */}
            <path d="M42 76 L42 56 Q50 50 58 56 L58 76 Z" fill="#ffffff" />
            <circle cx="50" cy="54" r="3.5" fill="#e11d48" />
            {/* Window Grid */}
            <rect x="30" y="44" width="8" height="12" fill="#fb7185" opacity="0.6" />
            <rect x="62" y="44" width="8" height="12" fill="#fb7185" opacity="0.6" />
          </svg>
        );

      default:
        return <QuantumLogo size={size * 0.8} />;
    }
  };

  if (!showContainer) {
    return (
      <div style={{ width: size, height: size }} className={`shrink-0 flex items-center justify-center ${className}`}>
        {renderEmblem()}
      </div>
    );
  }

  // Get matching glow tint for container
  const getGlowColor = () => {
    switch (companyId) {
      case 'quantum_initium': return '#0071e3';
      case 'immigratiepunt': return '#0284c7';
      case 'vvc': return '#d97706';
      case 'investbotiq': return '#059669';
      case 'spontiva': return '#db2777';
      case 'boostplug': return '#ea580c';
      case 'zheavenzy': return '#8b5cf6';
      case 'logs_rent': return '#64748b';
      case 'crmos': return '#0891b2';
      case 'djobba': return '#eab308';
      case 'trusting_work': return '#0d9488';
      case 'woningvry': return '#e11d48';
      default: return '#0071e3';
    }
  };

  const glow = getGlowColor();

  return (
    <div
      style={{
        width: size,
        height: size,
        boxShadow: `0 8px 24px -4px ${glow}35, inset 0 1px 1px 0 rgba(255,255,255,0.2)`
      }}
      className={`rounded-2xl p-2 bg-[#121217]/90 border border-white/15 backdrop-blur-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${className}`}
    >
      {renderEmblem()}
    </div>
  );
};

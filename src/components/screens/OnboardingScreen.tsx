import React from 'react';
import { Shield, Radio, MapPin, Database, ArrowRight } from 'lucide-react';

export const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div style={{ padding: '20px 16px', maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, var(--emergency-red), #B91C1C)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto',
        boxShadow: 'var(--shadow-sos)'
      }}>
        <Shield style={{ width: '40px', height: '40px', color: '#FFF' }} />
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
        Disaster Communication Bridge
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px' }}>
        “When networks fail, communication connects lives.”
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '28px' }}>
        <div className="glass-panel" style={{ padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <Radio style={{ width: '24px', height: '24px', color: 'var(--mesh-cyan)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Nearby Device P2P Mesh</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Exchanges emergency reports device-to-device via Bluetooth & Wi-Fi Direct when cell towers fail.
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <MapPin style={{ width: '24px', height: '24px', color: 'var(--alert-amber)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>GPS Location & Landmarks</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Captures location coordinates and accuracy. Supports manual landmark fallbacks if GPS is unavailable indoors.
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <Database style={{ width: '24px', height: '24px', color: 'var(--sync-green)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Local SQLite Durability</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Saves SOS reports locally before attempting cloud sync. Reports persist across device restarts.
            </div>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={onComplete} style={{ width: '100%', minHeight: '52px', fontSize: '1rem' }}>
        <span>Grant Permissions & Start DCB</span>
        <ArrowRight style={{ width: '20px', height: '20px' }} />
      </button>
    </div>
  );
};

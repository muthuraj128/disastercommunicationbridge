import React from 'react';
import { Shield, Radio, Wifi, WifiOff, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { isOnline, role, setRole, theme, toggleTheme, p2pStatus } = useApp();

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      margin: '8px 12px 12px 12px',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--emergency-red), #B91C1C)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(220, 38, 38, 0.4)'
        }}>
          <Shield style={{ color: '#FFF', width: '22px', height: '22px' }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>DCB</span>
            <span style={{ fontSize: '0.65rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', padding: '1px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
              v1.0
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Disaster Communication Bridge
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <select 
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          style={{
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 8px',
            fontSize: '0.78rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="affected_person">Affected Person</option>
          <option value="volunteer">Volunteer</option>
          <option value="coordinator">Coordinator</option>
        </select>

        <div className={`badge ${p2pStatus.isEmergencyModeActive ? 'badge-mesh' : 'badge-local'}`} style={{ gap: '4px' }}>
          <Radio style={{ width: '12px', height: '12px', animation: p2pStatus.isEmergencyModeActive ? 'spinSlow 4s linear infinite' : 'none' }} />
          <span>{p2pStatus.isEmergencyModeActive ? 'Mesh ON' : 'Mesh OFF'}</span>
        </div>

        <div className={`badge ${isOnline ? 'badge-synced' : 'badge-high'}`} style={{ gap: '4px' }}>
          {isOnline ? <Wifi style={{ width: '12px', height: '12px' }} /> : <WifiOff style={{ width: '12px', height: '12px' }} />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        <button 
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Toggle Dark/Light Mode"
        >
          {theme === 'dark' ? <Sun style={{ width: '18px', height: '18px', color: '#F59E0B' }} /> : <Moon style={{ width: '18px', height: '18px', color: '#475569' }} />}
        </button>
      </div>
    </header>
  );
};

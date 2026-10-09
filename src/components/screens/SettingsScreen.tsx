import React from 'react';
import { Settings, Shield, Database, Trash2, RefreshCw, Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsScreen: React.FC = () => {
  const { 
    clearAllData, 
    syncWithCloud, 
    reports, 
    transferLogs, 
    theme, 
    toggleTheme, 
    isOnline, 
    p2pStatus 
  } = useApp();

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to delete all local SOS reports and transfer logs? This cannot be undone.')) {
      await clearAllData();
      alert('Local database wiped successfully.');
    }
  };

  return (
    <div style={{ padding: '0 12px 28px 12px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings style={{ width: '22px', height: '22px', color: 'var(--accent-blue)' }} />
          <span>System Settings & Privacy</span>
        </h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Manage local SQLite storage, permissions & cloud synchronization
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield style={{ width: '18px', height: '18px', color: 'var(--sync-green)' }} />
          <span>Granted App Permissions</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>GPS Location Permission</span>
            <span className="badge badge-synced">GRANTED</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Nearby Devices (Bluetooth/Wi-Fi)</span>
            <span className={`badge ${p2pStatus.isEmergencyModeActive ? 'badge-synced' : 'badge-mesh'}`}>
              {p2pStatus.isEmergencyModeActive ? 'ACTIVE' : 'READY'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Local SQLite Persistence</span>
            <span className="badge badge-synced">ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database style={{ width: '18px', height: '18px', color: 'var(--accent-blue)' }} />
          <span>Storage & Sync Diagnostic</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.8rem', marginBottom: '12px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '6px' }}>
            <div style={{ color: 'var(--text-muted)' }}>Local Reports</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{reports.length} records</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '6px' }}>
            <div style={{ color: 'var(--text-muted)' }}>P2P Transfer Logs</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{transferLogs.length} logs</div>
          </div>
        </div>

        <button onClick={syncWithCloud} className="btn btn-outline" style={{ width: '100%', minHeight: '40px', fontSize: '0.85rem' }}>
          <RefreshCw style={{ width: '16px', height: '16px' }} />
          <span>Trigger Cloud Sync ({isOnline ? 'Online' : 'Offline'})</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Appearance Theme</div>
        <button onClick={toggleTheme} className="btn btn-outline" style={{ minHeight: '36px', padding: '0 12px', fontSize: '0.8rem' }}>
          {theme === 'dark' ? <Sun style={{ width: '16px', height: '16px', color: '#F59E0B' }} /> : <Moon style={{ width: '16px', height: '16px' }} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--emergency-red-border)' }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--emergency-red)', marginBottom: '6px' }}>
          Data Privacy & Wipe
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Wipe all cached SOS reports and transfer histories from local device SQLite database.
        </p>
        <button onClick={handleClearData} className="btn btn-danger" style={{ width: '100%', minHeight: '42px', fontSize: '0.85rem' }}>
          <Trash2 style={{ width: '16px', height: '16px' }} />
          <span>WIPE ALL LOCAL DATA</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, Radio, Wifi, WifiOff, RefreshCw, ChevronRight, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HomeScreen: React.FC = () => {
  const { 
    setActiveScreen, 
    p2pStatus, 
    toggleEmergencyMode, 
    isOnline, 
    reports, 
    peers, 
    syncWithCloud,
    role
  } = useApp();

  const pendingSyncCount = reports.filter(r => r.syncStatus === 'pending').length;
  const criticalCount = reports.filter(r => r.severity === 'critical').length;

  return (
    <div style={{ padding: '0 12px 24px 12px', maxWidth: '640px', margin: '0 auto' }}>
      
      <div className="glass-panel" style={{
        padding: '24px 16px',
        textAlign: 'center',
        marginBottom: '16px',
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--emergency-red-bg) 100%)',
        border: '1px solid var(--emergency-red-border)'
      }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emergency-red)', marginBottom: '4px' }}>
          EMERGENCY ASSISTANCE
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Tap below to create an offline SOS report. Saved instantly to local device storage.
        </p>

        <button
          className="pulse-sos"
          onClick={() => setActiveScreen('report_form')}
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EF4444, #991B1B)',
            border: '4px solid #FFFFFF',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sos)'
          }}
        >
          <AlertTriangle style={{ width: '48px', height: '48px', marginBottom: '4px' }} />
          <span style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.05em' }}>SOS</span>
        </button>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          Works without internet connection using device-to-device mesh forwarding.
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity style={{ width: '18px', height: '18px', color: 'var(--mesh-cyan)' }} />
            <span>Communication Bridge Status</span>
          </div>
          <button 
            onClick={syncWithCloud}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-blue)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw style={{ width: '14px', height: '14px' }} />
            <span>Sync</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{
            background: p2pStatus.isEmergencyModeActive ? 'var(--mesh-cyan-bg)' : 'var(--bg-surface-elevated)',
            border: `1px solid ${p2pStatus.isEmergencyModeActive ? 'var(--mesh-cyan-border)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Radio style={{ width: '16px', height: '16px', color: 'var(--mesh-cyan)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Nearby Mesh</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {p2pStatus.isEmergencyModeActive ? `${peers.length} nearby peers found` : 'P2P Discovery Disabled'}
              </div>
            </div>
            <button
              onClick={toggleEmergencyMode}
              style={{
                marginTop: '10px',
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                background: p2pStatus.isEmergencyModeActive ? 'var(--emergency-red)' : 'var(--mesh-cyan)',
                color: '#FFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {p2pStatus.isEmergencyModeActive ? 'Stop Mesh' : 'Enable Mesh'}
            </button>
          </div>

          <div style={{
            background: isOnline ? 'var(--sync-green-bg)' : 'var(--alert-amber-bg)',
            border: `1px solid ${isOnline ? 'var(--sync-green-border)' : 'var(--alert-amber-border)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                {isOnline ? <Wifi style={{ width: '16px', height: '16px', color: 'var(--sync-green)' }} /> : <WifiOff style={{ width: '16px', height: '16px', color: 'var(--alert-amber)' }} />}
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{isOnline ? 'Cloud Online' : 'Cloud Offline'}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {pendingSyncCount > 0 ? `${pendingSyncCount} reports pending sync` : 'All local reports synced'}
              </div>
            </div>
            <button
              onClick={() => setActiveScreen('my_reports')}
              style={{
                marginTop: '10px',
                padding: '6px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              View Reports
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emergency-red)' }}>{criticalCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Critical SOS</div>
        </div>
        <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--mesh-cyan)' }}>{reports.length}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Reports</div>
        </div>
        <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sync-green)' }}>{peers.length}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mesh Peers</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px' }}>Active Role Workflows ({role.replace('_', ' ')})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {role === 'coordinator' && (
            <button
              className="btn btn-outline"
              onClick={() => setActiveScreen('coordinator_dash')}
              style={{ justifyContent: 'space-between', width: '100%' }}
            >
              <span>Open Coordinator Relief Matching Dashboard</span>
              <ChevronRight style={{ width: '18px', height: '18px' }} />
            </button>
          )}

          {(role === 'volunteer' || role === 'coordinator') && (
            <button
              className="btn btn-outline"
              onClick={() => setActiveScreen('volunteer_dash')}
              style={{ justifyContent: 'space-between', width: '100%' }}
            >
              <span>Manage Volunteer Relief Resources</span>
              <ChevronRight style={{ width: '18px', height: '18px' }} />
            </button>
          )}

          <button
            className="btn btn-outline"
            onClick={() => setActiveScreen('nearby')}
            style={{ justifyContent: 'space-between', width: '100%' }}
          >
            <span>Inspect Device-to-Device Mesh Logs</span>
            <ChevronRight style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

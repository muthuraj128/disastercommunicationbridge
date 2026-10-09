import React from 'react';
import { Radio, Smartphone, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NearbyScreen: React.FC = () => {
  const { p2pStatus, toggleEmergencyMode, peers, transferLogs } = useApp();

  return (
    <div style={{ padding: '0 12px 28px 12px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mesh-cyan)' }}>
            <Radio style={{ width: '22px', height: '22px' }} />
            <span>Nearby Device P2P Mesh</span>
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Store-and-forward mesh propagation without internet cell towers
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>P2P Emergency Mesh Mode</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {p2pStatus.isEmergencyModeActive ? 'Broadcasting & discovering nearby DCB peers...' : 'Mesh transceiver is currently OFF'}
            </div>
          </div>
          <button
            onClick={toggleEmergencyMode}
            className={`btn ${p2pStatus.isEmergencyModeActive ? 'btn-danger' : 'btn-primary'}`}
            style={{ minHeight: '40px', padding: '0 14px', fontSize: '0.85rem' }}
          >
            {p2pStatus.isEmergencyModeActive ? 'STOP MESH' : 'START MESH'}
          </button>
        </div>

        <div style={{
          background: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          fontSize: '0.78rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
          <div><span style={{ color: 'var(--text-muted)' }}>Platform Engine:</span> <strong>{p2pStatus.platform === 'android_native' ? 'Android Native SDK' : 'Web Broadcast Channel'}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Connected Peers:</span> <strong>{peers.filter(p => p.status === 'connected').length}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Service ID:</span> <code>DCB_P2P_SERVICE_V1</code></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Protocol Ver:</span> <code>1.0</code></div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Compatible Mesh Peers ({peers.length})</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>RSSI Signal Strength</span>
        </div>

        {peers.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No nearby DCB devices discovered. Ensure Emergency Mode is turned on on neighboring phones.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {peers.map(peer => (
              <div key={peer.id} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Smartphone style={{ width: '20px', height: '20px', color: 'var(--mesh-cyan)' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{peer.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ID: {peer.id} • Protocol {peer.protocolVersion}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${peer.status === 'connected' ? 'badge-synced' : 'badge-mesh'}`}>
                    {peer.status}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                    {peer.rssi} dBm
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '10px' }}>
          Durable Transfer Audit Log ({transferLogs.length})
        </div>

        {transferLogs.length === 0 ? (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
            No peer transfers recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {transferLogs.map(log => (
              <div key={log.id} style={{
                background: 'var(--bg-surface-elevated)',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {log.direction === 'OUTBOUND' ? (
                    <ArrowUpRight style={{ width: '14px', height: '14px', color: 'var(--accent-blue)' }} />
                  ) : (
                    <ArrowDownLeft style={{ width: '14px', height: '14px', color: 'var(--sync-green)' }} />
                  )}
                  <span style={{ fontWeight: 600 }}>{log.direction}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>[{log.messageId}]</span>
                </div>
                <div>
                  <span className="badge badge-synced" style={{ fontSize: '0.65rem' }}>{log.status}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', marginLeft: '6px' }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

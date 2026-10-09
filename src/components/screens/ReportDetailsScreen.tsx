import React from 'react';
import { MapPin, Radio, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { EmergencyReport } from '../../types/dcb';

export const ReportDetailsScreen: React.FC<{ reportId?: string; onBack: () => void }> = ({ reportId, onBack }) => {
  const { reports } = useApp();

  const report: EmergencyReport = reports.find(r => r.id === reportId) || reports[0];

  if (!report) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Report not found.</div>
        <button onClick={onBack} className="btn btn-outline" style={{ marginTop: '12px' }}>Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 12px 28px 12px', maxWidth: '640px', margin: '0 auto' }}>
      <button onClick={onBack} className="btn btn-outline" style={{ minHeight: '36px', padding: '0 10px', fontSize: '0.8rem', marginBottom: '14px' }}>
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        <span>Back to List</span>
      </button>

      <div className="glass-panel" style={{ padding: '18px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <span className="badge badge-critical">{report.severity.toUpperCase()}</span>
            <span className="badge badge-mesh" style={{ marginLeft: '6px' }}>{report.category.toUpperCase()}</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{report.id}</span>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>{report.description}</h2>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <MapPin style={{ width: '16px', height: '16px', color: 'var(--emergency-red)' }} />
          <span>{report.location.locationName}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '8px', fontSize: '0.78rem' }}>
          <div><span style={{ color: 'var(--text-muted)' }}>Source Device:</span> <code style={{ fontSize: '0.72rem' }}>{report.sourceDeviceId}</code></div>
          <div><span style={{ color: 'var(--text-muted)' }}>People Affected:</span> <strong>{report.peopleAffected}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Created At:</span> <strong>{new Date(report.createdAt).toLocaleString()}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Status:</span> <strong>{report.status}</strong></div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--mesh-cyan)' }}>
          <Radio style={{ width: '18px', height: '18px' }} />
          <span>Multi-Hop P2P Mesh Relay Audit Path ({report.forwardingHistory?.length || 0} Hops)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(report.forwardingHistory || []).map((hop, index) => (
            <div key={index} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.78rem'
            }}>
              <div>
                <div style={{ fontWeight: 700 }}>Hop #{index + 1}: {hop.deviceAlias || hop.deviceId}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Device Hash: {hop.deviceId}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                {new Date(hop.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { FileText, Radio, Cloud, CheckCircle, Clock, MapPin, ChevronRight, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { EmergencyReport } from '../../types/dcb';

export const MyReportsScreen: React.FC = () => {
  const { reports, broadcastReport, setActiveScreen } = useApp();

  const getStatusBadge = (report: EmergencyReport) => {
    switch (report.status) {
      case 'local_only':
        return <span className="badge badge-local"><Clock style={{ width: '10px', height: '10px' }} /> Local Only</span>;
      case 'sent_to_peer':
        return <span className="badge badge-mesh"><Radio style={{ width: '10px', height: '10px' }} /> Sent to Peer</span>;
      case 'received_by_peer':
        return <span className="badge badge-mesh"><Radio style={{ width: '10px', height: '10px' }} /> Mesh Relayed</span>;
      case 'uploaded_cloud':
        return <span className="badge badge-synced"><Cloud style={{ width: '10px', height: '10px' }} /> Uploaded Cloud</span>;
      case 'assigned':
        return <span className="badge badge-high"><CheckCircle style={{ width: '10px', height: '10px' }} /> Assigned</span>;
      case 'resolved':
        return <span className="badge badge-synced"><CheckCircle style={{ width: '10px', height: '10px' }} /> Resolved</span>;
      default:
        return <span className="badge badge-local">{report.status}</span>;
    }
  };

  const getSeverityBadge = (sev: EmergencyReport['severity']) => {
    switch (sev) {
      case 'critical':
        return <span className="badge badge-critical">CRITICAL</span>;
      case 'high':
        return <span className="badge badge-high">HIGH</span>;
      default:
        return <span className="badge badge-local">{sev.toUpperCase()}</span>;
    }
  };

  return (
    <div style={{ padding: '0 12px 28px 12px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText style={{ width: '22px', height: '22px', color: 'var(--accent-blue)' }} />
            <span>Emergency Reports Log</span>
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Track local persistence, peer transfers & cloud sync state
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveScreen('report_form')} style={{ padding: '0 12px', minHeight: '38px', fontSize: '0.8rem' }}>
          + New SOS
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
          <AlertCircle style={{ width: '40px', height: '40px', color: 'var(--text-subtle)', marginBottom: '8px' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>No Saved Reports</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Create an SOS report when you need emergency assistance.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reports.map((report) => (
            <div key={report.id} className="glass-panel" style={{ padding: '14px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {getSeverityBadge(report.severity)}
                  {getStatusBadge(report)}
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {report.category.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                  {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', lineHeight: 1.3 }}>
                {report.description}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                <MapPin style={{ width: '14px', height: '14px', color: 'var(--emergency-red)' }} />
                <span>{report.location.locationName}</span>
                {report.location.isStale && <span style={{ color: 'var(--alert-amber)', fontSize: '0.7rem' }}>(Stale)</span>}
              </div>

              <div style={{
                background: 'var(--bg-surface-elevated)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Affected: </span>
                  <span style={{ fontWeight: 700 }}>{report.peopleAffected} person(s)</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Hop Count: </span>
                  <span style={{ fontWeight: 700 }}>{report.hopCount}/{report.hopLimit}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Sync: </span>
                  <span style={{ fontWeight: 700, color: report.syncStatus === 'synced' ? 'var(--sync-green)' : 'var(--alert-amber)' }}>
                    {report.syncStatus}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {report.status === 'local_only' && (
                  <button
                    onClick={() => broadcastReport(report.id)}
                    className="btn btn-outline"
                    style={{ minHeight: '32px', padding: '0 10px', fontSize: '0.75rem' }}
                  >
                    <Radio style={{ width: '12px', height: '12px' }} />
                    <span>Broadcast over Mesh</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveScreen('coordinator_dash')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-blue)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <span>Details</span>
                  <ChevronRight style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

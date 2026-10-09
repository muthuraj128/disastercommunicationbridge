import React, { useState } from 'react';
import { LayoutDashboard, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { MatchRecommendation } from '../../types/dcb';
import { ReliefMatchingEngine } from '../../services/matching/reliefMatchingEngine';

export const CoordinatorDashboard: React.FC = () => {
  const { reports, resources, shelters } = useApp();

  const [selectedReportId, setSelectedReportId] = useState<string | null>(reports[0]?.id || null);
  const [filterSeverity] = useState<string>('all');
  const [filterCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'queue' | 'matching' | 'shelters'>('matching');
  const [assignedStatusMap, setAssignedStatusMap] = useState<Record<string, string>>({});

  const selectedReport = reports.find(r => r.id === selectedReportId) || reports[0];

  const recommendations: MatchRecommendation[] = selectedReport 
    ? ReliefMatchingEngine.matchResourcesForReport(selectedReport, resources) 
    : [];

  const filteredReports = reports.filter(r => {
    if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    return true;
  });

  const handleConfirmAssignment = (reportId: string, resourceName: string) => {
    setAssignedStatusMap(prev => ({ ...prev, [reportId]: `Assigned to ${resourceName}` }));
  };

  return (
    <div style={{ padding: '0 12px 28px 12px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)' }}>
            <LayoutDashboard style={{ width: '22px', height: '22px' }} />
            <span>Coordinator Command Center</span>
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Match emergency needs with available relief resources & shelters
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {[
          { id: 'matching', label: 'Relief Matcher' },
          { id: 'queue', label: `SOS Queue (${reports.length})` },
          { id: 'shelters', label: `Shelters (${shelters.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: 'var(--radius-sm)',
              border: activeTab === tab.id ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
              background: activeTab === tab.id ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
              color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'matching' && (
        <div>
          <div className="glass-panel" style={{ padding: '14px', marginBottom: '14px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Select Target Emergency Report to Match:
            </label>
            <select
              className="input-field"
              value={selectedReportId || ''}
              onChange={(e) => setSelectedReportId(e.target.value)}
              style={{ fontWeight: 600 }}
            >
              {reports.map(r => (
                <option key={r.id} value={r.id}>
                  [{r.severity.toUpperCase()}] {r.category.toUpperCase()} - {r.description.substring(0, 50)}... ({r.peopleAffected} people)
                </option>
              ))}
            </select>

            {selectedReport && (
              <div style={{ marginTop: '12px', background: 'var(--bg-surface)', padding: '10px', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                  <span className="badge badge-critical">{selectedReport.severity.toUpperCase()}</span>
                  <span className="badge badge-mesh">{selectedReport.category.toUpperCase()}</span>
                  <span style={{ fontWeight: 700 }}>{selectedReport.peopleAffected} People Affected</span>
                </div>
                <div>{selectedReport.description}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>📍 {selectedReport.location.locationName}</div>
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)' }}>
              <Sparkles style={{ width: '18px', height: '18px' }} />
              <span>Explainable AI Resource Match Recommendations</span>
            </div>

            {recommendations.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                No active resources available for matching.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recommendations.map((rec, index) => (
                  <div key={rec.resource?.id} style={{
                    background: 'var(--bg-surface)',
                    border: index === 0 ? '2px solid var(--sync-green)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>
                          #{index + 1} {rec.resource?.ownerName} ({rec.resource?.resourceType.replace('_', ' ').toUpperCase()})
                        </span>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          📞 {rec.resource?.ownerPhone} • Capacity: {rec.resource?.availableCapacity}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: rec.score > 70 ? 'var(--sync-green)' : 'var(--alert-amber)' }}>
                          {rec.score}/100
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Match Score</div>
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '0.78rem',
                      lineHeight: 1.4,
                      marginBottom: '10px',
                      color: 'var(--text-main)'
                    }}>
                      💡 <strong>Match Rationale:</strong> {rec.matchRationale}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distance: {rec.distanceKm} km</span>
                      {assignedStatusMap[selectedReport.id] ? (
                        <span className="badge badge-synced">{assignedStatusMap[selectedReport.id]}</span>
                      ) : (
                        <button
                          onClick={() => handleConfirmAssignment(selectedReport.id, rec.resource?.ownerName || 'Volunteer')}
                          className="btn btn-primary"
                          style={{ minHeight: '34px', padding: '0 12px', fontSize: '0.78rem' }}
                        >
                          Confirm Help Assignment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>Synchronized Reports Queue</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredReports.map(r => (
              <div key={r.id} style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.description}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.location.locationName} • {r.peopleAffected} affected</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'shelters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {shelters.map(shelter => (
            <div key={shelter.id} className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>{shelter.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Manager: {shelter.managerName} ({shelter.managerPhone})</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--sync-green)' }}>
                Occupancy: {shelter.currentOccupancy} / {shelter.totalCapacity} beds
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

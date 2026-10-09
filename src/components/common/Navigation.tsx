import React from 'react';
import { Home, AlertTriangle, FileText, Radio, HeartHandshake, LayoutDashboard, Settings, Map } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navigation: React.FC = () => {
  const { activeScreen, setActiveScreen, role } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, roles: ['affected_person', 'volunteer', 'coordinator'] },
    { id: 'report_form', label: 'SOS Alert', icon: AlertTriangle, roles: ['affected_person', 'volunteer', 'coordinator'], highlight: true },
    { id: 'my_reports', label: 'My Reports', icon: FileText, roles: ['affected_person', 'volunteer', 'coordinator'] },
    { id: 'nearby', label: 'P2P Mesh', icon: Radio, roles: ['affected_person', 'volunteer', 'coordinator'] },
    { id: 'volunteer_dash', label: 'Volunteer', icon: HeartHandshake, roles: ['volunteer', 'coordinator'] },
    { id: 'coordinator_dash', label: 'Coordinator', icon: LayoutDashboard, roles: ['coordinator'] },
    { id: 'map_fallback', label: 'Offline Map', icon: Map, roles: ['affected_person', 'volunteer', 'coordinator'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['affected_person', 'volunteer', 'coordinator'] }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      bottom: 0,
      left: '12px',
      right: '12px',
      zIndex: 100,
      padding: '6px 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      borderRadius: 'var(--radius-lg)',
      marginBottom: '10px'
    }}>
      {visibleItems.map(item => {
        const Icon = item.icon;
        const isActive = activeScreen === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            style={{
              background: item.highlight ? 'linear-gradient(135deg, var(--emergency-red), #B91C1C)' : isActive ? 'var(--bg-surface-elevated)' : 'transparent',
              color: item.highlight ? '#FFFFFF' : isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: item.highlight ? 'none' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              minWidth: '58px',
              transition: 'all 0.2s ease',
              boxShadow: item.highlight ? '0 2px 10px rgba(220, 38, 38, 0.4)' : 'none'
            }}
          >
            <Icon style={{ width: '20px', height: '20px' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: isActive || item.highlight ? 700 : 500 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

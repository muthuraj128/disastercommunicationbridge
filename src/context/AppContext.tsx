import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { 
  EmergencyReport, 
  UserRole, 
  ReliefResource, 
  Shelter, 
  PeerDevice, 
  P2PTransferLog,
  P2PMessageEnvelope,
  ReportCategory,
  ReportSeverity
} from '../types/dcb';
import { localRepo } from '../services/storage/localRepository';
import { nearbyBridge } from '../services/p2p/nearbyBridge';
import type { P2PBridgeStatus } from '../services/p2p/nearbyBridge';
import { MeshProtocolEngine } from '../services/p2p/meshProtocolEngine';
import { CloudSyncWorker } from '../services/supabase/supabaseClient';
import { INITIAL_SAMPLE_RESOURCES, INITIAL_SAMPLE_SHELTERS } from '../data/mockData';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isOnline: boolean;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  
  reports: EmergencyReport[];
  resources: ReliefResource[];
  shelters: Shelter[];
  peers: PeerDevice[];
  transferLogs: P2PTransferLog[];
  
  p2pStatus: P2PBridgeStatus;
  isEmergencyMode: boolean;
  toggleEmergencyMode: () => Promise<void>;
  
  createSOSReport: (data: {
    category: ReportCategory;
    severity: ReportSeverity;
    description: string;
    peopleAffected: number;
    landmarkName?: string;
    contactInfo?: string;
    evidenceNotes?: string;
  }) => Promise<EmergencyReport>;

  broadcastReport: (reportId: string) => Promise<boolean>;
  syncWithCloud: () => Promise<{ syncedCount: number; errorsCount: number }>;
  refreshData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('affected_person');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [resources] = useState<ReliefResource[]>(INITIAL_SAMPLE_RESOURCES);
  const [shelters] = useState<Shelter[]>(INITIAL_SAMPLE_SHELTERS);
  const [peers, setPeers] = useState<PeerDevice[]>([]);
  const [transferLogs, setTransferLogs] = useState<P2PTransferLog[]>([]);
  const [p2pStatus, setP2pStatus] = useState<P2PBridgeStatus>(nearbyBridge.getStatus());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      CloudSyncWorker.syncPendingReports().then(() => loadLocalData());
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    loadLocalData();

    const unsubscribePeers = nearbyBridge.subscribePeers((updatedPeers) => {
      setPeers(updatedPeers);
      setP2pStatus(nearbyBridge.getStatus());
    });

    const unsubscribeMessages = nearbyBridge.subscribeMessages(async (envelope: P2PMessageEnvelope, senderId: string) => {
      const result = await MeshProtocolEngine.processInboundEnvelope(envelope, senderId);
      if (result.status === 'ACCEPTED') {
        await loadLocalData();
      }
    });

    return () => {
      unsubscribePeers();
      unsubscribeMessages();
    };
  }, []);

  const loadLocalData = async () => {
    const localReports = await localRepo.getReports();
    const logs = await localRepo.getTransferLogs();
    setReports(localReports);
    setTransferLogs(logs);
    setP2pStatus(nearbyBridge.getStatus());
  };

  const toggleEmergencyMode = async () => {
    if (p2pStatus.isEmergencyModeActive) {
      const newStatus = await nearbyBridge.stopEmergencyMode();
      setP2pStatus(newStatus);
    } else {
      const newStatus = await nearbyBridge.startEmergencyMode();
      setP2pStatus(newStatus);
    }
  };

  const createSOSReport = async (data: {
    category: ReportCategory;
    severity: ReportSeverity;
    description: string;
    peopleAffected: number;
    landmarkName?: string;
    contactInfo?: string;
    evidenceNotes?: string;
  }): Promise<EmergencyReport> => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 72 * 3600 * 1000).toISOString();

    const newReport: EmergencyReport = {
      id: `rep_${uuidv4().substring(0, 8)}`,
      sourceDeviceId: nearbyBridge.getDeviceId(),
      category: data.category,
      severity: data.severity,
      description: data.description,
      peopleAffected: data.peopleAffected,
      location: {
        latitude: 13.0827,
        longitude: 80.2707,
        accuracy: 10.0,
        locationName: data.landmarkName || 'Anna Nagar West, Chennai',
        isStale: false,
        timestamp: now.toISOString()
      },
      contactInfo: data.contactInfo,
      evidenceNotes: data.evidenceNotes,
      status: 'local_only',
      syncStatus: 'pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt,
      hopCount: 0,
      hopLimit: 5,
      forwardingHistory: [
        { deviceId: nearbyBridge.getDeviceId(), deviceAlias: 'Self Device', timestamp: now.toISOString() }
      ]
    };

    await localRepo.saveReport(newReport);
    await loadLocalData();

    if (p2pStatus.isEmergencyModeActive) {
      await broadcastReport(newReport.id);
    }

    if (isOnline) {
      CloudSyncWorker.syncPendingReports().then(() => loadLocalData());
    }

    return newReport;
  };

  const broadcastReport = async (reportId: string): Promise<boolean> => {
    const report = await localRepo.getReportById(reportId);
    if (!report) return false;

    const envelope = MeshProtocolEngine.createEnvelope(report, nearbyBridge.getDeviceId());
    const success = await nearbyBridge.sendEnvelopeToPeer(envelope);
    
    if (success) {
      await localRepo.updateReportStatus(report.id, 'sent_to_peer');
      await loadLocalData();
    }
    return success;
  };

  const syncWithCloud = async () => {
    const result = await CloudSyncWorker.syncPendingReports();
    await loadLocalData();
    return result;
  };

  const clearAllData = async () => {
    await localRepo.clearAllLocalData();
    await loadLocalData();
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      isOnline,
      activeScreen,
      setActiveScreen,
      reports,
      resources,
      shelters,
      peers,
      transferLogs,
      p2pStatus,
      isEmergencyMode: p2pStatus.isEmergencyModeActive,
      toggleEmergencyMode,
      createSOSReport,
      broadcastReport,
      syncWithCloud,
      refreshData: loadLocalData,
      clearAllData,
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import type { EmergencyReport, P2PMessageEnvelope, P2PTransferLog } from '../../types/dcb';
import { INITIAL_SAMPLE_REPORTS, SAMPLE_TRANSFER_LOGS } from '../../data/mockData';

const STORAGE_KEYS = {
  REPORTS: 'dcb_local_reports_v1',
  MESSAGES: 'dcb_local_messages_v1',
  TRANSFER_LOGS: 'dcb_transfer_logs_v1',
  SETTINGS: 'dcb_settings_v1'
};

// Memory fallback store for Node.js / test environments
const memoryStore: Record<string, string> = {};

const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return memoryStore[key] || null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    } else {
      memoryStore[key] = value;
    }
  },
  removeItem: (key: string): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    } else {
      delete memoryStore[key];
    }
  }
};

class LocalRepository {
  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (!safeStorage.getItem(STORAGE_KEYS.REPORTS)) {
      safeStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_SAMPLE_REPORTS));
    }
    if (!safeStorage.getItem(STORAGE_KEYS.TRANSFER_LOGS)) {
      safeStorage.setItem(STORAGE_KEYS.TRANSFER_LOGS, JSON.stringify(SAMPLE_TRANSFER_LOGS));
    }
    if (!safeStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      safeStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
    }
  }

  public async getReports(): Promise<EmergencyReport[]> {
    try {
      const raw = safeStorage.getItem(STORAGE_KEYS.REPORTS);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Failed to read local reports', err);
      return [];
    }
  }

  public async getReportById(id: string): Promise<EmergencyReport | null> {
    const reports = await this.getReports();
    return reports.find(r => r.id === id) || null;
  }

  public async saveReport(report: EmergencyReport): Promise<EmergencyReport> {
    const reports = await this.getReports();
    const index = reports.findIndex(r => r.id === report.id);
    
    if (index >= 0) {
      reports[index] = { ...report, updatedAt: new Date().toISOString() };
    } else {
      reports.unshift(report);
    }
    
    safeStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    return report;
  }

  public async updateReportStatus(
    id: string, 
    status: EmergencyReport['status'], 
    syncStatus?: EmergencyReport['syncStatus']
  ): Promise<EmergencyReport | null> {
    const reports = await this.getReports();
    const report = reports.find(r => r.id === id);
    if (!report) return null;

    report.status = status;
    if (syncStatus) report.syncStatus = syncStatus;
    report.updatedAt = new Date().toISOString();

    safeStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    return report;
  }

  public async saveP2PMessage(envelope: P2PMessageEnvelope): Promise<boolean> {
    try {
      const raw = safeStorage.getItem(STORAGE_KEYS.MESSAGES);
      const messages: P2PMessageEnvelope[] = raw ? JSON.parse(raw) : [];
      
      if (messages.some(m => m.messageId === envelope.messageId)) {
        return false;
      }

      messages.unshift(envelope);
      safeStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      return true;
    } catch (err) {
      console.error('Failed to save P2P message', err);
      return false;
    }
  }

  public async isMessageProcessed(messageId: string): Promise<boolean> {
    const raw = safeStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: P2PMessageEnvelope[] = raw ? JSON.parse(raw) : [];
    return messages.some(m => m.messageId === messageId);
  }

  public async logTransfer(log: P2PTransferLog): Promise<void> {
    const raw = safeStorage.getItem(STORAGE_KEYS.TRANSFER_LOGS);
    const logs: P2PTransferLog[] = raw ? JSON.parse(raw) : [];
    logs.unshift(log);
    safeStorage.setItem(STORAGE_KEYS.TRANSFER_LOGS, JSON.stringify(logs));
  }

  public async getTransferLogs(): Promise<P2PTransferLog[]> {
    const raw = safeStorage.getItem(STORAGE_KEYS.TRANSFER_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  public async clearAllLocalData(): Promise<void> {
    safeStorage.removeItem(STORAGE_KEYS.REPORTS);
    safeStorage.removeItem(STORAGE_KEYS.MESSAGES);
    safeStorage.removeItem(STORAGE_KEYS.TRANSFER_LOGS);
    this.initStorage();
  }
}

export const localRepo = new LocalRepository();

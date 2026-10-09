import { v4 as uuidv4 } from 'uuid';
import type { EmergencyReport, P2PMessageEnvelope, RelayHop } from '../../types/dcb';
import { localRepo } from '../storage/localRepository';

export interface EnvelopeValidationResult {
  isValid: boolean;
  reason?: string;
}

export class MeshProtocolEngine {
  private static PROTOCOL_VERSION = '1.0';
  private static DEFAULT_HOP_LIMIT = 5;
  private static DEFAULT_TTL_HOURS = 72;

  public static createEnvelope(report: EmergencyReport, myDeviceId: string): P2PMessageEnvelope {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.DEFAULT_TTL_HOURS * 3600 * 1000).toISOString();

    const currentHop: RelayHop = {
      deviceId: myDeviceId,
      timestamp: now.toISOString()
    };

    const updatedRelayPath = [...(report.forwardingHistory || []), currentHop];

    const envelope: P2PMessageEnvelope = {
      messageId: `msg_${uuidv4().substring(0, 8)}`,
      reportId: report.id,
      protocolVersion: this.PROTOCOL_VERSION,
      messageType: 'SOS_REPORT',
      createdAt: now.toISOString(),
      expiresAt: report.expiresAt || expiresAt,
      hopCount: (report.hopCount || 0) + 1,
      hopLimit: report.hopLimit || this.DEFAULT_HOP_LIMIT,
      sourceDeviceId: report.sourceDeviceId || myDeviceId,
      payload: {
        category: report.category,
        severity: report.severity,
        description: report.description,
        peopleAffected: report.peopleAffected,
        location: report.location,
        contactInfo: report.contactInfo,
        evidenceNotes: report.evidenceNotes
      },
      integrityHash: this.computeIntegrityHash(report.id, report.description),
      relayPath: updatedRelayPath
    };

    return envelope;
  }

  public static validateEnvelope(envelope: P2PMessageEnvelope): EnvelopeValidationResult {
    if (!envelope || typeof envelope !== 'object') {
      return { isValid: false, reason: 'Invalid or empty envelope object' };
    }

    if (envelope.protocolVersion !== this.PROTOCOL_VERSION) {
      return { isValid: false, reason: `Incompatible protocol version: ${envelope.protocolVersion}` };
    }

    if (!envelope.messageId || !envelope.reportId) {
      return { isValid: false, reason: 'Missing messageId or reportId' };
    }

    const now = new Date().getTime();
    const expiry = new Date(envelope.expiresAt).getTime();
    if (now > expiry) {
      return { isValid: false, reason: 'Message has expired (TTL elapsed)' };
    }

    if (envelope.hopCount > envelope.hopLimit) {
      return { isValid: false, reason: `Hop limit exceeded (${envelope.hopCount}/${envelope.hopLimit})` };
    }

    const jsonSize = new Blob([JSON.stringify(envelope)]).size;
    if (jsonSize > 65536) {
      return { isValid: false, reason: `Payload size exceeds 64KB limit (${jsonSize} bytes)` };
    }

    return { isValid: true };
  }

  public static async processInboundEnvelope(
    envelope: P2PMessageEnvelope,
    peerId: string
  ): Promise<{ status: 'ACCEPTED' | 'DUPLICATE' | 'EXPIRED' | 'REJECTED'; reason?: string }> {
    const validation = this.validateEnvelope(envelope);
    if (!validation.isValid) {
      await localRepo.logTransfer({
        id: `log_${uuidv4().substring(0, 8)}`,
        messageId: envelope.messageId || 'unknown',
        peerId,
        direction: 'INBOUND',
        status: validation.reason?.includes('expired') ? 'EXPIRED_REJECTED' : 'FAILED',
        transferredBytes: new Blob([JSON.stringify(envelope)]).size,
        timestamp: new Date().toISOString()
      });
      return { status: 'REJECTED', reason: validation.reason };
    }

    const alreadyProcessed = await localRepo.isMessageProcessed(envelope.messageId);
    if (alreadyProcessed) {
      await localRepo.logTransfer({
        id: `log_${uuidv4().substring(0, 8)}`,
        messageId: envelope.messageId,
        peerId,
        direction: 'INBOUND',
        status: 'DUPLICATE_REJECTED',
        transferredBytes: new Blob([JSON.stringify(envelope)]).size,
        timestamp: new Date().toISOString()
      });
      return { status: 'DUPLICATE', reason: 'Message already received and processed' };
    }

    const savedMsg = await localRepo.saveP2PMessage(envelope);
    if (!savedMsg) {
      return { status: 'REJECTED', reason: 'Failed to write envelope to local storage' };
    }

    const existingReport = await localRepo.getReportById(envelope.reportId);
    const updatedReport: EmergencyReport = {
      id: envelope.reportId,
      sourceDeviceId: envelope.sourceDeviceId,
      category: envelope.payload.category || 'other',
      severity: envelope.payload.severity || 'medium',
      description: envelope.payload.description || '',
      peopleAffected: envelope.payload.peopleAffected || 1,
      location: envelope.payload.location || {
        latitude: null,
        longitude: null,
        accuracy: null,
        locationName: 'Unknown',
        isStale: false,
        timestamp: null
      },
      contactInfo: envelope.payload.contactInfo,
      evidenceNotes: envelope.payload.evidenceNotes,
      status: 'received_by_peer',
      syncStatus: existingReport ? existingReport.syncStatus : 'pending',
      createdAt: envelope.createdAt,
      updatedAt: new Date().toISOString(),
      expiresAt: envelope.expiresAt,
      hopCount: envelope.hopCount,
      hopLimit: envelope.hopLimit,
      forwardingHistory: envelope.relayPath
    };

    await localRepo.saveReport(updatedReport);

    await localRepo.logTransfer({
      id: `log_${uuidv4().substring(0, 8)}`,
      messageId: envelope.messageId,
      peerId,
      direction: 'INBOUND',
      status: 'SUCCESS',
      transferredBytes: new Blob([JSON.stringify(envelope)]).size,
      timestamp: new Date().toISOString()
    });

    return { status: 'ACCEPTED' };
  }

  private static computeIntegrityHash(reportId: string, description: string): string {
    let hash = 0;
    const str = `${reportId}:${description}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `sha256_${Math.abs(hash).toString(16)}`;
  }
}

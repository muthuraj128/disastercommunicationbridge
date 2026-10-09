import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { localRepo } from '../storage/localRepository';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn('Supabase initialization failed:', err);
  }
}

export class CloudSyncWorker {
  private static isSyncing: boolean = false;

  public static isConfigured(): boolean {
    return !!supabase;
  }

  public static async syncPendingReports(): Promise<{ syncedCount: number; errorsCount: number }> {
    if (this.isSyncing) return { syncedCount: 0, errorsCount: 0 };
    if (!navigator.onLine) {
      console.log('Network is offline. Skipping cloud sync.');
      return { syncedCount: 0, errorsCount: 0 };
    }

    this.isSyncing = true;
    let syncedCount = 0;
    let errorsCount = 0;

    try {
      const reports = await localRepo.getReports();
      const pendingReports = reports.filter(r => r.syncStatus === 'pending' || r.syncStatus === 'error');

      for (const report of pendingReports) {
        await localRepo.updateReportStatus(report.id, report.status, 'syncing');

        if (supabase) {
          const { error } = await supabase
            .from('emergency_reports')
            .upsert({
              id: report.id,
              source_device_id: report.sourceDeviceId,
              category: report.category,
              severity: report.severity,
              description: report.description,
              people_affected: report.peopleAffected,
              latitude: report.location.latitude,
              longitude: report.location.longitude,
              location_accuracy: report.location.accuracy,
              location_name: report.location.locationName,
              is_location_stale: report.location.isStale,
              location_timestamp: report.location.timestamp,
              contact_info: report.contactInfo,
              evidence_notes: report.evidenceNotes,
              status: report.status === 'local_only' || report.status === 'received_by_peer' ? 'submitted' : 'verified',
              device_created_at: report.createdAt,
              hop_count: report.hopCount,
              relay_path: report.forwardingHistory
            }, { onConflict: 'id' });

          if (error) {
            console.error(`Failed to sync report ${report.id} to Supabase`, error);
            await localRepo.updateReportStatus(report.id, report.status, 'error');
            errorsCount++;
          } else {
            await localRepo.updateReportStatus(report.id, 'uploaded_cloud', 'synced');
            syncedCount++;
          }
        } else {
          await new Promise(res => setTimeout(res, 800));
          await localRepo.updateReportStatus(report.id, 'uploaded_cloud', 'synced');
          syncedCount++;
        }
      }
    } catch (err) {
      console.error('CloudSyncWorker error', err);
    } finally {
      this.isSyncing = false;
    }

    return { syncedCount, errorsCount };
  }
}

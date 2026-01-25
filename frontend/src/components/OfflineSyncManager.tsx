"use client";

import { useEffect, useCallback } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineStorageService } from '@/services/offline-storage';
import axios from '@/lib/axios'; // Use configured axios instance
import { toast } from 'sonner';

export function OfflineSyncManager() {
  const { isOnline } = useNetworkStatus();

  const processQueue = useCallback(async () => {
    const queue = OfflineStorageService.getQueue();
    if (queue.length === 0) return;

    let successCount = 0;
    let failCount = 0;

    const promise = async () => {
      for (const item of queue) {
        try {
          // Use configured axios instance which handles auth and tenant headers automatically
          // Extract relative path from full URL if needed
          const url = item.url.startsWith('http') 
            ? item.url.replace(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001', '')
            : item.url;
          
          await axios({
            url: url,
            method: item.method,
            data: item.data,
          });

          OfflineStorageService.removeFromQueue(item.id);
          successCount++;
        } catch (error: any) {
          console.error(`Failed to sync item ${item.id}`, error);
          // If it's an auth error, don't retry (token might be expired)
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.error('Authentication failed during sync, removing from queue');
            OfflineStorageService.removeFromQueue(item.id);
            failCount++;
          } else {
            OfflineStorageService.updateRetryCount(item.id);
            failCount++;
          }
        }
      }

      if (successCount > 0) {
        return `Başarıyla senkronize edildi: ${successCount} kayıt.`;
      }
      if (failCount > 0) {
        throw new Error(`${failCount} kayıt senkronize edilemedi.`);
      }
    };

    toast.promise(promise(), {
      loading: 'Çevrimdışı veriler sunucuya gönderiliyor...',
      success: (data) => data as string,
      error: (err) => `Senkronizasyon hatası: ${err.message}`,
    });

  }, []);

  useEffect(() => {
    if (isOnline) {
      // Small delay to ensure connection is stable
      const timer = setTimeout(() => {
        processQueue();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, processQueue]);

  return null; // Headless component
}


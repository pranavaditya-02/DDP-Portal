import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import client from '@/lib/api';

interface DeadlineAlertResult {
  message: string;
  sent: number;
  skipped: number;
}

export function useDeadlineAlerts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<number | null>(null);
  const { user } = useAuthStore();

  const checkAndSendAlerts = useCallback(async (deadlines: Array<{
    taskId: string;
    taskTitle: string;
    deadlineISO: string;
    isCompleted?: boolean;
  }>) => {
    if (deadlines.length === 0) {
      return null;
    }

    // Only check once per day per browser session
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem('deadline_alerts_last_check');
    const lastAttempt = localStorage.getItem('deadline_alerts_last_attempt');
    
    if (lastCheck === today || lastAttempt === today) {
      console.log('Deadline alerts already checked today');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.post('/alerts/check-and-send', {
        facultyId: user?.id,
        facultyEmail: user?.email,
        facultyName: user?.name,
        deadlines: deadlines.map((d) => ({
          taskId: d.taskId,
          taskTitle: d.taskTitle,
          deadlineISO: d.deadlineISO,
          isCompleted: d.isCompleted || false,
        })),
      });

      const result: DeadlineAlertResult = response.data;
      
      // Mark that we checked alerts today
      localStorage.setItem('deadline_alerts_last_check', today);
      setLastCheckTime(Date.now());

      console.log('Deadline alerts checked:', {
        sent: result.sent,
        skipped: result.skipped,
      });

      return result;
    } catch (err) {
      localStorage.setItem('deadline_alerts_last_attempt', today);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.debug('Deadline alert check skipped (non-critical):', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const verifyEmailConfig = async (): Promise<boolean> => {
    try {
      const response = await client.get('/alerts/verify-email');
      return response.data.emailConfigured;
    } catch (err) {
      console.error('Error verifying email config:', err);
      return false;
    }
  };

  return {
    checkAndSendAlerts,
    verifyEmailConfig,
    loading,
    error,
    lastCheckTime,
  };
}

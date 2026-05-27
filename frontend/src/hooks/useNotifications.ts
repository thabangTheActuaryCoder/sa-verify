import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getUnreadCount as getCandidateUnread } from '../api/candidate';
import { getUnreadCount as getEmployerUnread } from '../api/employer';

export function useNotifications() {
  const { isAuthenticated, role } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated || !role) return;
    try {
      if (role === 'candidate') {
        setUnreadCount(await getCandidateUnread());
      } else if (role === 'employer') {
        setUnreadCount(await getEmployerUnread());
      }
    } catch {
      // Silently ignore fetch errors for polling
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { unreadCount, refetch: fetchCount };
}

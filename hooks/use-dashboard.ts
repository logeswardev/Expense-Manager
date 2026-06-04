import { initiateService } from '@/services/api';
import { useEffect, useState } from 'react';

export function useDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('May');
  const [calVisible, setCalVisible] = useState(false);

  useEffect(() => {
    initiateService()
      .then((data) => console.log('initiate response:', data))
      .catch((err) => console.error('initiate error:', err));
  }, []);

  return {
    selectedMonth,
    setSelectedMonth,
    calVisible,
    setCalVisible,
  };
}

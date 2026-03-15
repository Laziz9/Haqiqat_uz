import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { taskService, Task } from '../services/api';

export const useTasks = (district: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (signal: AbortSignal) => {
    if (!district) return;
    try {
      setLoading(true);
      const res = await taskService.getByDistrict(district, signal);
      setTasks(res.data);
      setError(null);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [district]);

  useEffect(() => {
    const controller = new AbortController();
    fetchTasks(controller.signal);
    return () => controller.abort();
  }, [fetchTasks]);

  return { tasks, loading, error, refresh: fetchTasks };
};

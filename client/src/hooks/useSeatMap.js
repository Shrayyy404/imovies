import { useState, useEffect, useCallback } from 'react';
import { showApi } from '../api/showApi.js';

// Portfolio demo: seats are generated locally and persist only for the current page session.
export function useSeatMap(showId) {
  const [layout, setLayout] = useState({ rows: 0, seatsPerRow: 0 });
  const [price, setPrice] = useState(0);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected] = useState(false);
  const [serverOffsetMs] = useState(0);

  const fetchSeatMap = useCallback(async () => {
    if (!showId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await showApi.getShowSeats(showId);
      const data = res?.data;
      setLayout(data?.layout || { rows: 6, seatsPerRow: 8 });
      setPrice(data?.price || 250);
      setSeats(data?.seats || []);
    } catch (err) {
      setError(err.message || 'Could not load demo seats.');
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => { fetchSeatMap(); }, [fetchSeatMap]);

  return { layout, price, seats, setSeats, loading, error, refetch: fetchSeatMap, connected, serverOffsetMs };
}

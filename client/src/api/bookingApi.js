import { demoShow, getBooking, saveBooking, makeId } from './demoData.js';

const wrap = (data) => ({ data: { success: true, data } });
export const bookingApi = {
  holdSeats: async (showId, seats) => {
    const show = demoShow(showId);
    const booking = saveBooking({ _id: makeId(), status: 'held', show, seats, amount: seats.length * show.price, holdExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), bookingCode: `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, createdAt: new Date().toISOString() });
    return { data: { data: booking } };
  },
  confirmDemoBooking: async (id) => {
    const booking = getBooking(id);
    if (!booking) throw new Error('Demo booking not found');
    return wrap(saveBooking({ ...booking, status: 'confirmed', confirmedAt: new Date().toISOString() }));
  },
  releaseHold: async (id) => { const b = getBooking(id); if (b) saveBooking({ ...b, status: 'cancelled' }); return wrap({ released: true }); },
  getBooking: async (id) => ({ data: getBooking(id) }),
  getMyBookings: async () => wrap([]),
  cancelBooking: async (id) => { const b = getBooking(id); return wrap(b ? saveBooking({ ...b, status: 'cancelled' }) : null); },
};

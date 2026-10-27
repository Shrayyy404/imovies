import { demoShow, createDemoSeats } from './demoData.js';
export const showApi = {
  getShows: async () => ({ success: true, data: [] }),
  getShow: async (id) => ({ success: true, data: demoShow(id) }),
  getShowSeats: async (id) => ({ success: true, data: { layout: { rows: 6, seatsPerRow: 8 }, price: demoShow(id).price, seats: createDemoSeats() } }),
};

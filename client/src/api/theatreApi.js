import { DEMO_CITIES, DEMO_THEATRE } from './demoData.js';
export const theatreApi = {
  getCities: async () => ({ success: true, data: DEMO_CITIES }),
  getTheatres: async ({ city } = {}) => ({ success: true, data: [{ ...DEMO_THEATRE, city: city || DEMO_CITIES[0] }] }),
};

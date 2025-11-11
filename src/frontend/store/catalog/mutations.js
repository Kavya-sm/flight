// @ts-nocheck

/**
 * Catalog [Vuex Module Mutation](https://vuex.vuejs.org/guide/mutations.html)
 * - SET_FLIGHTS replaces the current flight list with a new one.
 *   Ensures duplicates are removed based on flight ID.
 * @param {object} state - Vuex Catalog Module State
 * @param {Flight[]} flights - Array of Flights as payload
 */
export const SET_FLIGHTS = (state, flights) => {
  if (!Array.isArray(flights)) {
    console.warn("⚠️ SET_FLIGHTS called with non-array payload");
    flights = [];
  }

  // ✅ Deduplicate flights by ID
  const uniqueFlights = [];
  const seen = new Set();

  for (const f of flights) {
    if (f && !seen.has(f.id)) {
      seen.add(f.id);
      uniqueFlights.push(f);
    }
  }

  state.flights = uniqueFlights;
};

/**
 * Catalog [Vuex Module Mutation] - APPEND_FLIGHTS appends unique flights
 * (used only when pagination is implemented)
 */
export const APPEND_FLIGHTS = (state, flights) => {
  if (!Array.isArray(flights)) return;

  const combined = [...state.flights, ...flights];
  const uniqueFlights = [];
  const seen = new Set();

  for (const f of combined) {
    if (f && !seen.has(f.id)) {
      seen.add(f.id);
      uniqueFlights.push(f);
    }
  }

  state.flights = uniqueFlights;
};

/**
 * Catalog [Vuex Module Mutation] - Controls the content loader
 * @param {boolean} isLoading
 */
export const SET_LOADER = (state, isLoading) => {
  state.loading = !!isLoading;
};

/**
 * Catalog [Vuex Module Mutation] - Sets pagination token for next-page requests
 */
export const SET_FLIGHT_PAGINATION = (state, paginationToken) => {
  state.paginationToken = paginationToken || null;
};

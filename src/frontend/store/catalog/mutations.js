// store/catalog/mutations.js
// @ts-nocheck

/**
 * Sets or updates flights in the Vuex state.
 */
export const SET_FLIGHTS = (state, flights) => {
  // ✅ Replace old flights with new ones — avoids duplicates
  state.flights = flights;
};

/**
 * Sets the loader status (true/false).
 */
export const SET_LOADER = (state, isLoading) => {
  state.loading = isLoading;
};

/**
 * Sets pagination token (if used for "Load more" feature).
 */
export const SET_FLIGHT_PAGINATION = (state, paginationToken) => {
  state.paginationToken = paginationToken;
};

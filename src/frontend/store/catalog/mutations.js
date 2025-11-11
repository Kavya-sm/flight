// @ts-nocheck
/**
 * SET_FLIGHTS mutates Catalog state with an array of Flights as payload.
 * Always REPLACES the flights array with new results.
 */
export const SET_FLIGHTS = (state, flights) => {
  console.log("🔄 SET_FLIGHTS: Replacing all flights with", flights.length, "new flights");
  
  // REPLACE the entire flights array
  state.flights = flights;
};

/**
 * Controls content loader when necessary.
 */
export const SET_LOADER = (state, isLoading) => {
  state.loading = isLoading;
};

export const SET_FLIGHT_PAGINATION = (state, paginationToken) => {
  state.paginationToken = paginationToken;
};

/**
 * Catalog [Vuex Module] - Holds flights information from Catalog service.
 */
export default {
  flights: [],
  loading: false,
  paginationToken: ""
};

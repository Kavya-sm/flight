// @ts-nocheck
/**
 * SET_FLIGHTS mutates Catalog state with an array of Flights as payload.
 */
export const SET_FLIGHTS = (state, flights) => {
  console.log("🔄 SET_FLIGHTS: Replacing flights with", flights.length, "flights");
  
  // ALWAYS replace the flights array with the new results
  state.flights = flights;
  
  console.log("✅ SET_FLIGHTS: State now has", state.flights.length, "flights");
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

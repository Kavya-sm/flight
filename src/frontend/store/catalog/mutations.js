// @ts-nocheck
/**
 *
 * Catalog [Vuex Module Mutation](https://vuex.vuejs.org/guide/mutations.html) - SET_FLIGHT mutates Catalog state with an array of Flights as payload.
 * @param {object} state - Vuex Catalog Module State
 * @param {Flight[]} flights - Array of Flights as payload
 * @see {@link fetchFlights} for more info on action that calls SET_FLIGHTS
 * @see {@link fetchByFlightNumber} for more info on action that calls SET_FLIGHTS
 */
export const SET_FLIGHTS = async (state, flights) => {
  if (state.flights.length === 0) {
    state.flights = flights;
  } else {
    // flatten array of flights and remove possible duplicates due to network issues
    let newFlights = [...flights, state.flights].flat(5);
    state.flights = [...new Set(newFlights)];
  }
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

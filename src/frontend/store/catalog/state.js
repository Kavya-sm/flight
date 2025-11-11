// store/catalog/state.js

/**
 * Catalog [Vuex Module] - Holds flights and loader info from Catalog service.
 */
export default {
  flights: [],            // List of flight objects
  loading: false,         // Whether data is being fetched
  paginationToken: null   // For pagination (if backend supports it)
};

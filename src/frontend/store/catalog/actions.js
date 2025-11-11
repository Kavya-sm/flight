import Flight from "../../shared/models/FlightClass";

// 🏗️ State — holds flight data and loading status
const state = {
  flights: [],
  loading: false,
  paginationToken: null
};

// 🧮 Getters
const getters = {
  flights: state => state.flights,
  loading: state => state.loading,
  paginationToken: state => state.paginationToken
};

// ⚙️ Mutations — responsible for updating Vuex state
const mutations = {
  SET_FLIGHTS(state, flights) {
    // Replace instead of append to avoid duplicates
    state.flights = flights;
  },
  APPEND_FLIGHTS(state, flights) {
    // Append only unique flights (in case of pagination)
    const uniqueFlights = flights.filter(
      newFlight => !state.flights.some(f => f.id === newFlight.id)
    );
    state.flights = [...state.flights, ...uniqueFlights];
  },
  SET_FLIGHT_PAGINATION(state, token) {
    state.paginationToken = token;
  },
  SET_LOADER(state, status) {
    state.loading = status;
  }
};

// 🚀 Actions — perform async logic and commit mutations
const actions = {
  /**
   * Fetch all flights for a given route and date
   * Filters locally by departure/arrival since backend returns all flights
   */
  async fetchFlights({ commit }, { departure, arrival, paginationToken }) {
    console.group("store/catalog/actions/fetchFlights");
    commit("SET_LOADER", true);

    try {
      console.log(`✈️ Fetching flight data for ${departure} → ${arrival}`);

      // Fetch from backend (which returns JSON body as string or array)
      const response = await fetch(
        "https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod/search"
      );
      const data = await response.json();

      // ✅ Safely handle both stringified or parsed response bodies
      let flightsData = [];
      if (typeof data.body === "string") {
        flightsData = JSON.parse(data.body);
      } else if (Array.isArray(data.body)) {
        flightsData = data.body;
      } else if (Array.isArray(data)) {
        flightsData = data;
      } else {
        flightsData = [];
      }

      console.log("✅ Flights fetched:", flightsData.length);
      console.log("🔹 Sample flight:", flightsData[0]);

      // ✅ Flexible filter (matches both 'DEL'/'Delhi' cases)
      const filteredFlightsData = flightsData.filter(flight => {
        const from = flight.from?.trim().toLowerCase() || "";
        const to = flight.to?.trim().toLowerCase() || "";
        const dep = departure?.trim().toLowerCase() || "";
        const arr = arrival?.trim().toLowerCase() || "";
        return from.includes(dep) && to.includes(arr);
      });

      console.log(
        `✅ Filtered ${filteredFlightsData.length} flights for ${departure} → ${arrival}`
      );

      // ✅ Convert to Flight class instances
      const flights = filteredFlightsData.map(flightData =>
        new Flight({
          id: flightData.id,
          departureDate: flightData.departure,
          departureAirportCode: flightData.from,
          departureAirportName: flightData.from,
          arrivalDate: flightData.arrival,
          arrivalAirportCode: flightData.to,
          arrivalAirportName: flightData.to,
          ticketPrice: flightData.price,
          ticketCurrency: "INR",
          flightNumber: flightData.id,
          seatCapacity: flightData.seats || 100
        })
      );

      // ✅ Replace or append depending on pagination
      if (!paginationToken) {
        commit("SET_FLIGHTS", flights);
      } else {
        commit("APPEND_FLIGHTS", flights);
      }

      commit("SET_FLIGHT_PAGINATION", null);
    } catch (error) {
      console.error("❌ Error fetching flights:", error);
      throw error;
    } finally {
      commit("SET_LOADER", false);
      console.groupEnd();
    }
  },

  /**
   * Fetch a specific flight by ID
   */
  async fetchByFlightId({ commit }, { flightId }) {
    console.group("store/catalog/actions/fetchByFlightId");
    commit("SET_LOADER", true);

    try {
      const response = await fetch(
        "https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod/search"
      );
      const data = await response.json();

      // ✅ Safe parsing again
      let flightsData = [];
      if (typeof data.body === "string") {
        flightsData = JSON.parse(data.body);
      } else if (Array.isArray(data.body)) {
        flightsData = data.body;
      } else {
        flightsData = data || [];
      }

      // ✅ Find exact flight by ID
      const flightData = flightsData.find(flight => flight.id === flightId);
      if (!flightData) throw new Error(`Flight with ID ${flightId} not found`);

      const flight = new Flight({
        id: flightData.id,
        departureDate: flightData.departure,
        departureAirportCode: flightData.from,
        departureAirportName: flightData.from,
        arrivalDate: flightData.arrival,
        arrivalAirportCode: flightData.to,
        arrivalAirportName: flightData.to,
        ticketPrice: flightData.price,
        ticketCurrency: "INR",
        flightNumber: flightData.id,
        seatCapacity: flightData.seats || 100
      });

      console.log("✅ Fetched Flight by ID:", flight);
      return flight;
    } catch (error) {
      console.error("❌ Error fetching flight by ID:", error);
      throw error;
    } finally {
      commit("SET_LOADER", false);
      console.groupEnd();
    }
  }
};

// 🧩 Export module
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};



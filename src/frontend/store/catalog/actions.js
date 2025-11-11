import Flight from "../../shared/models/FlightClass";

const state = {
  flights: [],
  loading: false,
  paginationToken: null
};

const getters = {
  flights: state => state.flights,
  loading: state => state.loading,
  paginationToken: state => state.paginationToken
};

const mutations = {
  SET_FLIGHTS(state, flights) {
    state.flights = flights;
  },
  APPEND_FLIGHTS(state, flights) {
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

const actions = {
  /**
   * Fetch flights from REST API (Lambda backend)
   */
  async fetchFlights({ commit }, { departure, arrival}) {
    console.group("store/catalog/actions/fetchFlights");
    commit("SET_LOADER", true);

    try {
      console.log(`✈️ Fetching flights via Lambda for ${departure} → ${arrival}`);

      // 🔹 Call your Lambda REST endpoint with query parameters
      const url = `https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod/search?from=${departure}&to=${arrival}`;
      const response = await fetch(url);
      const data = await response.json();

      // 🔹 Handle both stringified and parsed body cases
      let flightsData = [];
      if (typeof data.body === "string") {
        flightsData = JSON.parse(data.body);
      } else if (Array.isArray(data.body)) {
        flightsData = data.body;
      } else {
        flightsData = data.Items || data || [];
      }

      console.log(`✅ Received ${flightsData.length} flights from Lambda`);

      // 🔹 Convert each flight to Flight class model
      const flights = flightsData.map(flightData =>
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

      // ✅ No need to filter — Lambda already returns correct flights
      commit("SET_FLIGHTS", flights);
      commit("SET_FLIGHT_PAGINATION", null);

      console.log("🟢 Flights stored in Vuex:", flights.length);
    } catch (error) {
      console.error("❌ Error fetching flights:", error);
      throw error;
    } finally {
      commit("SET_LOADER", false);
      console.groupEnd();
    }
  },

  /**
   * Fetch specific flight by ID
   */
  async fetchByFlightId({ commit }, { flightId }) {
    console.group("store/catalog/actions/fetchByFlightId");
    commit("SET_LOADER", true);

    try {
      const response = await fetch(
        "https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod/search"
      );
      const data = await response.json();

      let flightsData = [];
      if (typeof data.body === "string") {
        flightsData = JSON.parse(data.body);
      } else if (Array.isArray(data.body)) {
        flightsData = data.body;
      } else {
        flightsData = data.Items || data || [];
      }

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

      console.log("✅ Fetched flight by ID:", flight);
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

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};



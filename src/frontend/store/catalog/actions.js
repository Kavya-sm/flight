import Flight from "../../shared/models/FlightClass";

/**
 * Fetch flights for a given route from your Lambda REST API.
 * Filters duplicates, clears previous results, and updates Vuex cleanly.
 */
export async function fetchFlights({ commit, state }, { departure, arrival }) {
  console.group("store/catalog/actions/fetchFlights");
  commit("SET_LOADER", true);

  try {
    // 🧹 Clear old data before loading new flights
    commit("SET_FLIGHTS", []);

    console.log(`✈️ Fetching flights via Lambda for ${departure} → ${arrival}`);

    // 🔹 Call your Lambda REST API with query parameters
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

    console.log(`🔸 Raw flights received: ${flightsData.length}`);

    // ✅ Remove duplicates (same flight ID)
    const uniqueFlights = [];
    const seen = new Set();
    for (const f of flightsData) {
      if (f && !seen.has(f.id)) {
        seen.add(f.id);
        uniqueFlights.push(f);
      }
    }

    console.log(`✅ Unique flights after filtering: ${uniqueFlights.length}`);

    // 🔹 Convert each to Flight class instance
    const flights = uniqueFlights.map(flightData =>
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

    // ✅ Update Vuex store
    commit("SET_FLIGHTS", flights);
    commit("SET_FLIGHT_PAGINATION", null);

    console.log("🟢 Flights stored in Vuex:", flights.length);
    commit("SET_LOADER", false);
    console.groupEnd();
  } catch (error) {
    console.error("❌ Error fetching flights:", error);
    commit("SET_LOADER", false);
    throw error;
  }
}

/**
 * Fetch a specific flight by ID (used in SelectedFlight page)
 */
export async function fetchByFlightId({ commit }, { flightId }) {
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
    commit("SET_LOADER", false);
    console.groupEnd();
    return flight;
  } catch (error) {
    console.error("❌ Error fetching flight by ID:", error);
    commit("SET_LOADER", false);
    throw error;
  }
}




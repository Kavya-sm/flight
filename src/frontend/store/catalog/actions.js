import Flight from "../../shared/models/FlightClass";

/**
 * Catalog Action — fetchFlights
 * Fetches flights from your Lambda REST API and filters them by route.
 */
export async function fetchFlights({ commit }, { departure, arrival }) {
  console.group("store/catalog/actions/fetchFlights");
  commit("SET_LOADER", true);

  try {
    const url = `https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod/search?from=${departure}&to=${arrival}`;
    console.log("🌐 Fetching:", url);

    const response = await fetch(url);
    const data = await response.json();
    console.log("📦 Raw Lambda response:", data);

    // Handle both stringified & parsed bodies
    let flightsData = [];
    if (typeof data.body === "string") {
      flightsData = JSON.parse(data.body);
    } else if (Array.isArray(data.body)) {
      flightsData = data.body;
    } else {
      flightsData = data.Items || [];
    }

    console.log("✈️ All flights received:", flightsData);

    // Filter by route (case-insensitive)
    const filteredFlightsData = flightsData.filter(
      flight =>
        flight.from?.toLowerCase() === departure?.toLowerCase() &&
        flight.to?.toLowerCase() === arrival?.toLowerCase()
    );
    console.log("✅ Filtered flights:", filteredFlightsData);

    // Map to Flight model instances
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

    console.log("🛫 Final mapped flights:", flights);

    // Commit to Vuex
    commit("SET_FLIGHTS", flights);
    commit("SET_FLIGHT_PAGINATION", null);
  } catch (error) {
    console.error("❌ Error fetching flights:", error);
    throw error;
  } finally {
    commit("SET_LOADER", false);
    console.groupEnd();
  }
}

/**
 * Catalog Action — fetchByFlightId
 * Fetches one flight by ID (used on FlightSelection page).
 */
export async function fetchByFlightId({ commit }, { flightId }) {
  console.group("store/catalog/actions/fetchByFlightId");
  commit("SET_LOADER", true);

  try {
    const url =
      "https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod/search";
    console.log("🌐 Fetching:", url);

    const response = await fetch(url);
    const data = await response.json();

    let flightsData = [];
    if (typeof data.body === "string") {
      flightsData = JSON.parse(data.body);
    } else if (Array.isArray(data.body)) {
      flightsData = data.body;
    } else {
      flightsData = data.Items || [];
    }

    const flightData = flightsData.find(f => f.id === flightId);
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

    console.log("✅ Fetched single flight:", flight);
    return flight;
  } catch (error) {
    console.error("❌ Error fetching flight by ID:", error);
    throw error;
  } finally {
    commit("SET_LOADER", false);
    console.groupEnd();
  }
}





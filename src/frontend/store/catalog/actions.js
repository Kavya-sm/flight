// store/catalog/actions.js
import Flight from "../../shared/models/FlightClass";

export async function fetchFlights({ commit }, { date, departure, arrival, paginationToken = null }) {
  console.group("🚀 fetchFlights ACTION");
  commit("SET_LOADER", true);

  try {
    console.log("🔍 Fetching flights for:", { departure, arrival, date });

    const departureUpper = departure.toUpperCase();
    const arrivalUpper = arrival.toUpperCase();
    
    const url = `https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod/search?from=${departureUpper}&to=${arrivalUpper}`;

    console.log("🌐 Making API call to:", url);

    const response = await fetch(url);
    
    console.log("📡 Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("📦 Raw API response:", data);
    
    // FIXED: Handle the API response properly
    let flightsData;
    if (data && typeof data.body === 'string') {
      // API returns { body: "[{...}]" } where body is a JSON string
      flightsData = JSON.parse(data.body);
    } else if (Array.isArray(data)) {
      // If response is directly an array
      flightsData = data;
    } else if (data && Array.isArray(data.body)) {
      // If body is already an array
      flightsData = data.body;
    } else {
      // Fallback
      flightsData = data || [];
    }

    console.log("🛫 Processed flights data:", flightsData);
    console.log("🔢 Number of flights returned:", flightsData.length);

    // Ensure it's an array
    if (!Array.isArray(flightsData)) {
      console.warn("⚠️ flightsData is not an array, converting:", flightsData);
      flightsData = [flightsData];
    }

    // Remove duplicates by flight ID
    const uniqueFlightsData = flightsData.filter((flight, index, self) => 
      index === self.findIndex(f => f.id === flight.id)
    );

    console.log("🔍 Creating Flight objects from:", uniqueFlightsData);

    const flights = uniqueFlightsData.map(flightData => {
      console.log("✈️ Processing flight:", flightData);
      return new Flight({
        id: flightData.id,
        departureDate: flightData.departure,
        departureAirportCode: flightData.from,
        departureAirportName: flightData.from,
        arrivalDate: flightData.arrival,
        arrivalAirportCode: flightData.to,
        arrivalAirportName: flightData.to,
        ticketPrice: flightData.price,
        ticketCurrency: "EUR",
        flightNumber: flightData.id,
        seatCapacity: flightData.seats || 100
      });
    });

    console.log("✅ Final Flight objects:", flights);
    console.log("🔢 Final number of Flight objects:", flights.length);
    
    commit("SET_FLIGHTS", flights);
    commit("SET_FLIGHT_PAGINATION", paginationToken);
    commit("SET_LOADER", false);
    
    console.groupEnd();
    return flights;
    
  } catch (error) {
    console.error("❌ Error in fetchFlights:", error);
    commit("SET_LOADER", false);
    throw new Error(`Failed to fetch flights: ${error.message}`);
  }
}

export async function fetchByFlightId({ commit }, { flightId }) {
  try {
    console.group("store/catalog/actions/fetchByFlightId");
    commit("SET_LOADER", true);

    const response = await fetch(
      "https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod/search"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // FIXED: Use the same response handling logic
    let flightsData;
    if (data && typeof data.body === 'string') {
      flightsData = JSON.parse(data.body);
    } else if (Array.isArray(data)) {
      flightsData = data;
    } else if (data && Array.isArray(data.body)) {
      flightsData = data.body;
    } else {
      flightsData = data || [];
    }

    const flightData = flightsData.find(flight => flight.id === flightId);

    if (!flightData) {
      throw new Error(`Flight with ID ${flightId} not found`);
    }

    const flight = new Flight({
      id: flightData.id,
      departureDate: flightData.departure,
      departureAirportCode: flightData.from,
      departureAirportName: flightData.from,
      arrivalDate: flightData.arrival,
      arrivalAirportCode: flightData.to,
      arrivalAirportName: flightData.to,
      ticketPrice: flightData.price,
      ticketCurrency: "EUR",
      flightNumber: flightData.id,
      seatCapacity: flightData.seats || 100
    });

    console.log(flight);
    commit("SET_LOADER", false);
    console.groupEnd();
    return flight;
  } catch (error) {
    console.error(error);
    commit("SET_LOADER", false);
    throw error;
  }
}



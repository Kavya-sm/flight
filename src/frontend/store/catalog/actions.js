// store/catalog/actions.js
import Flight from "../../shared/models/FlightClass";

export async function fetchFlights({ commit }, { date, departure, arrival, paginationToken = null }) {
  console.group("store/catalog/actions/fetchFlights");
  commit("SET_LOADER", true);

  try {
    console.log("Fetching flight data via REST API for:", { departure, arrival, date });

    // Build URL with all parameters - ensure cities are uppercase
    const departureUpper = departure.toUpperCase();
    const arrivalUpper = arrival.toUpperCase();
    
    const url = `https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod/search?from=${departureUpper}&to=${arrivalUpper}`;

    console.log("API URL:", url);

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Raw API response:", data);
    
    let flightsData;
    if (typeof data.body === 'string') {
      flightsData = JSON.parse(data.body);
    } else {
      flightsData = data.body || data;
    }

    // Ensure it's an array
    if (!Array.isArray(flightsData)) {
      flightsData = [flightsData];
    }

    console.log("Processed flights data:", flightsData);

    // Remove duplicates by flight ID before creating Flight objects
    const uniqueFlightsData = flightsData.filter((flight, index, self) => 
      index === self.findIndex(f => f.id === flight.id)
    );

    const flights = uniqueFlightsData.map(flightData =>
      new Flight({
        id: flightData.id,
        departureDate: flightData.departure,
        departureAirportCode: flightData.from,
        departureAirportName: flightData.from, // You might want to map this to actual airport names
        arrivalDate: flightData.arrival,
        arrivalAirportCode: flightData.to,
        arrivalAirportName: flightData.to, // You might want to map this to actual airport names
        ticketPrice: flightData.price,
        ticketCurrency: "EUR",
        flightNumber: flightData.id,
        seatCapacity: flightData.seats || 100
      })
    );

    console.log("Final unique flights:", flights);
    commit("SET_FLIGHTS", flights);
    commit("SET_FLIGHT_PAGINATION", paginationToken);
    commit("SET_LOADER", false);
    console.groupEnd();
    
    return flights;
  } catch (error) {
    commit("SET_LOADER", false);
    console.error("Error fetching flights:", error);
    this.$q?.notify?.(`Error fetching flights: ${error.message}`);
    throw new Error(error);
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
    const flightsData = JSON.parse(data.body);

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



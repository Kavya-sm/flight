// @ts-nocheck
/**
 * Filters an array of Flights object through departure and/or arrival Date
 * @param {Flight[]} flights - Array of Flight Class to filter on
 * @param {Date} departure - Departure date by filter
 * @param {Date} arrival - Arrival date by filter
 * @returns {Flight[]} flights - Array of Flight Class filtered
 * @example
 * // return flights departing at 8am or later
 * const departure = "2019-04-04T08:00+0000"
 * const filteredFlights = filterBySchedule(flights, { departure })
 * @example
 * // return flights arriving at 11am or later
 * const arrival = "2019-04-04T11:00+0000"
 * const filteredFlights = filterBySchedule(flights, { arrival })
 */
export const scheduleFilter = {
  methods: {
    filterBySchedule(flights, { departure, arrival }) {
      if (!departure && !arrival) return flights;

      console.log("=== SCHEDULE FILTER DEBUG ===");
      console.log("Departure filter:", departure);
      console.log("Arrival filter:", arrival);

      let filtered = [...flights];

      if (departure) {
        // Ensure departure is a proper Date object
        const departureFilter = new Date(departure);
        console.log("Departure filter time:", departureFilter.toISOString());

        filtered = filtered.filter(flight => {
          // Convert flight departure to Date object
          const flightDepartureStr = flight.departureDate || flight.departure;
          const flightDeparture = new Date(flightDepartureStr);
          
          if (isNaN(flightDeparture.getTime())) {
            console.warn("Invalid flight departure date:", flightDepartureStr);
            return true;
          }

          console.log("Flight departure:", flightDeparture.toISOString());
          const passesFilter = flightDeparture >= departureFilter;
          console.log("Passes departure filter:", passesFilter);
          
          return passesFilter;
        });
      }

      if (arrival) {
        // Ensure arrival is a proper Date object
        const arrivalFilter = new Date(arrival);
        console.log("Arrival filter time:", arrivalFilter.toISOString());

        filtered = filtered.filter(flight => {
          // Convert flight arrival to Date object
          const flightArrivalStr = flight.arrivalDate || flight.arrival;
          const flightArrival = new Date(flightArrivalStr);
          
          if (isNaN(flightArrival.getTime())) {
            console.warn("Invalid flight arrival date:", flightArrivalStr);
            return true;
          }

          console.log("Flight arrival:", flightArrival.toISOString());
          const passesFilter = flightArrival <= arrivalFilter;
          console.log("Passes arrival filter:", passesFilter);
          
          return passesFilter;
        });
      }

      console.log("Final filtered count:", filtered.length);
      return filtered;
    }
  }
};

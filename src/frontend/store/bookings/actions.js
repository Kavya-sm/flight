import { Loading } from "quasar";

const BOOKINGS_API_URL = "https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod";

export async function createBooking({ commit, rootState }, { outboundFlight, passengers, contactInfo, userId }) {
  console.group("CREATE BOOKING");
  Loading.show({ message: "Creating booking..." });

  try {
    // Get user ID from profile store
    const user = rootState.profile?.user;
    const actualUserId = userId || user?.id || user?.sub || user?.username;
    
    console.log("User from profile:", user);
    console.log("Extracted user ID:", actualUserId);

    if (!actualUserId) {
      throw new Error("User not authenticated");
    }

    const bookingData = {
      userId: actualUserId,
      flightId: outboundFlight.id,
      passengers: passengers,
      contactInfo: contactInfo
    };

    console.log("Sending booking data:", bookingData);

    const response = await fetch(`${BOOKINGS_API_URL}/booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const result = await response.json();
    console.log("Booking API response:", result);

    // Transform the API response to match front-end format
    if (result.success) {
      const transformedBooking = {
        id: result.bookingId || result.booking?.id,
        bookingReference: result.bookingId || result.booking?.id,
        createdAt: new Date().toISOString(),
        outboundFlight: {
          id: outboundFlight.id,
          departureAirportCode: outboundFlight.departureAirportCode,
          arrivalAirportCode: outboundFlight.arrivalAirportCode,
          departureDate: outboundFlight.departureDate,
          arrivalDate: outboundFlight.arrivalDate,
          departureAirportName: outboundFlight.departureAirportName,
          arrivalAirportName: outboundFlight.arrivalAirportName,
          airline: outboundFlight.airline,
          ticketPrice: outboundFlight.ticketPrice,
          ticketCurrency: outboundFlight.ticketCurrency,
          flightNumber: outboundFlight.flightNumber
        },
        totalPrice: outboundFlight.ticketPrice * passengers.length,
        status: 'confirmed'
      };
      
      console.log("Transformed booking for Vuex:", transformedBooking);
      commit("ADD_BOOKING", transformedBooking);
    }

    Loading.hide();
    console.groupEnd();
    return result;

  } catch (error) {
    console.error("Booking error:", error);
    Loading.hide();
    throw error;
  }
}

export async function fetchBookings({ commit, rootState }) {
  console.group("FETCH BOOKINGS");

  try {
    const user = rootState.profile?.user;
    const userId = user?.id || user?.sub || user?.username;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    console.log("Fetching bookings for user:", userId);

    const response = await fetch(`${BOOKINGS_API_URL}/bookings?userId=${userId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }

    const result = await response.json();
    console.log("Bookings API response:", result);

    if (result.bookings && Array.isArray(result.bookings)) {
      // The API already returns bookings in the correct format with outboundFlight
      console.log("Transformed bookings for Vuex:", result.bookings);
      commit("SET_BOOKINGS", result.bookings);
    } else {
      console.log("No bookings found or invalid format");
      commit("SET_BOOKINGS", []);
    }

    console.groupEnd();
    return result;

  } catch (error) {
    console.error("Fetch bookings error:", error);
    throw error;
  }
}

export async function fetchLoyaltyInfo({ commit, rootState }, { userId }) {
  console.group("FETCH LOYALTY INFO");

  try {
    if (!userId) {
      const user = rootState.profile?.user;
      userId = user?.id || user?.sub || user?.username;
    }

    console.log("Fetching loyalty for user:", userId);
    const response = await fetch(`${BOOKINGS_API_URL}/loyalty?userId=${userId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch loyalty info");
    }

    const result = await response.json();
    console.log("Loyalty info:", result);

    commit("SET_LOYALTY_POINTS", result);

    console.groupEnd();
    return result;

  } catch (error) {
    console.error("Fetch loyalty error:", error);
    throw error;
  }
}

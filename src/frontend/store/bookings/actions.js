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
    console.log("Booking created:", result);

    if (result.booking) {
      commit("ADD_BOOKING", result.booking);
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
    console.log("Bookings fetched:", result);

    if (result.bookings) {
      commit("SET_BOOKINGS", result.bookings);
    }

    console.groupEnd();
    return result;

  } catch (error) {
    console.error("Fetch bookings error:", error);
    throw error;
  }
}


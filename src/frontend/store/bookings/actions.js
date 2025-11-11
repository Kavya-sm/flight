// store/bookings/actions.js
import { Loading } from "quasar";

const BOOKINGS_API_URL =
  "https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod";

/**
 * Create booking via REST API
 */
export async function createBooking(
  { commit, rootState },
  { outboundFlight, passengers, contactInfo, userId }
) {
  console.group("store/bookings/actions/createBooking");
  Loading.show({ message: "Creating booking..." });

  try {
    // Get userId from auth store if not provided
    if (!userId) {
      userId =
        rootState.auth?.user?.id ||
        rootState.auth?.userId ||
        rootState.auth?.user?.sub ||
        rootState.auth?.user?.username;

      console.log("🔄 Retrieved userId from auth:", userId);
    }

    if (!userId) {
      throw new Error("User ID is required. Please log in.");
    }

    if (!outboundFlight || !outboundFlight.id) {
      throw new Error("Flight information is required");
    }

    // Provide default passengers if undefined
    if (!passengers) {
      passengers = [
        {
          name: "Passenger",
          email: "passenger@example.com"
        }
      ];
      console.warn("⚠️ Using default passengers:", passengers);
    }

    if (passengers.length === 0) {
      throw new Error("At least one passenger is required");
    }

    // Provide default contact info if undefined
    if (!contactInfo) {
      contactInfo = {
        email: passengers[0]?.email || "contact@example.com",
        phone: "+1234567890",
        name: passengers[0]?.name || "Passenger"
      };
      console.warn("⚠️ Using default contact info:", contactInfo);
    }

    if (!contactInfo.email) {
      throw new Error("Contact information with email is required");
    }

    const bookingData = {
      userId: userId,
      flightId: outboundFlight.id,
      passengers: passengers,
      contactInfo: contactInfo
    };

    console.log("📤 Final validated booking data:", bookingData);

    const response = await fetch(`${BOOKINGS_API_URL}/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bookingData)
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorText}`
      );
    }

    const result = await response.json();
    console.log("✅ Booking created:", result);

    // Add the booking to Vuex state
    if (result.success && result.booking) {
      console.log("🔄 Committing booking to Vuex:", result.booking);
      commit("ADD_BOOKING", result.booking);
    } else {
      console.warn("⚠️ No booking data in response:", result);
    }

    Loading.hide();
    console.groupEnd();
    return result;
  } catch (error) {
    console.error("❌ Booking creation error:", error);
    Loading.hide();
    throw error;
  }
}

/**
 * Fetch user bookings via REST API
 */
export async function fetchBookings({ commit, rootState }) {
  console.group("store/bookings/actions/fetchBookings");

  try {
    // Get userId from auth store
    const userId =
      rootState.auth?.user?.id ||
      rootState.auth?.userId ||
      rootState.auth?.user?.sub ||
      rootState.auth?.user?.username;

    if (!userId) {
      throw new Error("No user ID available. Please log in.");
    }

    console.log("👤 Fetching bookings for user:", userId);
    const response = await fetch(
      `${BOOKINGS_API_URL}/bookings?userId=${userId}`
    );

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorText}`
      );
    }

    const result = await response.json();
    console.log("✅ User bookings:", result);

    // Update Vuex state
    if (result.bookings) {
      console.log(`🔄 Committing ${result.bookings.length} bookings to Vuex`);
      commit("SET_BOOKINGS", result.bookings);
    } else {
      console.warn("⚠️ No bookings array in response");
      commit("SET_BOOKINGS", []);
    }

    console.groupEnd();
    return result;
  } catch (error) {
    console.error("❌ Fetch bookings error:", error);
    throw error;
  }
}

/**
 * Fetch loyalty info via REST API
 */
export async function fetchLoyaltyInfo({ commit, rootState }, { userId }) {
  console.group("store/bookings/actions/fetchLoyaltyInfo");

  try {
    if (!userId) {
      userId = rootState.auth?.user?.id || rootState.auth?.userId;
    }

    console.log("👤 Fetching loyalty for user:", userId);
    const response = await fetch(
      `${BOOKINGS_API_URL}/loyalty?userId=${userId}`
    );

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorText}`
      );
    }

    const result = await response.json();
    console.log("✅ Loyalty info:", result);

    // Update Vuex state
    commit("SET_LOYALTY_POINTS", result);

    console.groupEnd();
    return result;
  } catch (error) {
    console.error("❌ Fetch loyalty error:", error);
    throw error;
  }
}

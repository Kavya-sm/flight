import Booking from "../../shared/models/BookingClass";
// @ts-ignore
import { Loading } from "quasar";

/**
 * Fetch bookings from REST API
 */
export async function fetchBooking(
  { commit, rootState, rootGetters },
  paginationToken = ""
) {
  console.group("store/bookings/actions/fetchBooking");
  Loading.show({
    message: "Loading bookings..."
  });

  try {
    const userId =
      rootState.profile.user?.id || rootGetters["profile/userAttributes"]?.sub;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    let url = `${process.env.VUE_APP_API_URL}/bookings?userId=${userId}`;
    if (paginationToken) {
      url += `&paginationToken=${paginationToken}`;
    }

    console.log("Fetching booking data from:", url);
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch bookings");
    }

    console.log("RAW API RESPONSE FROM LAMBDA:", JSON.stringify(data, null, 2));

    // Transform the API response to match your existing Booking class structure
    const bookings = data.bookings.map(booking => {
      const bookingData = {
        id: booking.bookingID,
        bookingReference: booking.bookingID,
        status: "CONFIRMED",
        customer: userId,
        createdAt: new Date().toISOString(),
        outboundFlight: {
          id: booking.flight.id,
          departureDate: booking.flight.departureDate,
          departureAirportCode: booking.flight.departureAirportCode,
          departureAirportName: booking.flight.departureAirportName,
          departureCity: booking.flight.departureAirportCode,
          arrivalDate: booking.flight.arrivalDate,
          arrivalAirportCode: booking.flight.arrivalAirportCode,
          arrivalAirportName: booking.flight.arrivalAirportName,
          arrivalCity: booking.flight.arrivalAirportCode,
          ticketPrice: booking.flight.ticketPrice,
          ticketCurrency: "USD",
          flightNumber: booking.flight.airline,
          airline: booking.flight.airline,
          seatCapacity: 180
        },
        checkedIn: false,
        paymentToken: "mock_payment_token"
      };

      return new Booking(bookingData);
    });

    console.log("Transformed bookings:", bookings);

    if (paginationToken) {
      commit("APPEND_BOOKINGS", bookings);
    } else {
      commit("SET_BOOKINGS", bookings);
    }
    commit("SET_BOOKING_PAGINATION", data.paginationToken);

    Loading.hide();
    console.groupEnd();
    return bookings;
  } catch (err) {
    Loading.hide();
    console.error(err);
    throw new Error(err);
  }
}

/**
 * Create booking with mock payment (no Stripe required)
 */
export async function createBooking({ rootState }, { outboundFlight }) {
  console.group("store/bookings/actions/createBooking");
  try {
    const userId = rootState.profile.user?.id;
    const customerEmail =
      rootState.profile.user?.attributes?.email || rootState.profile.user?.email;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    console.info(`Processing booking for flight ${outboundFlight.id}`);

    Loading.show({
      message: "Creating a new booking..."
    });

    // Prepare booking data for REST API
    const bookingData = {
      userId: userId,
      flightId: outboundFlight.id,
      passengers: [
        {
          firstName: rootState.profile.user?.firstName || "Customer",
          lastName: rootState.profile.user?.lastName || "User",
          email: customerEmail
        }
      ],
      contactInfo: {
        email: customerEmail,
        phone: "+1234567890"
      }
    };

    console.log("Booking data:", bookingData);

    const response = await fetch(`${process.env.VUE_APP_API_URL}/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create booking");
    }

    console.log("Booking created successfully:", data);

    const bookingResponse = {
      id: data.bookingId,
      bookingReference: data.bookingId,
      status: "CONFIRMED"
    };

    Loading.hide();
    console.groupEnd();
    return bookingResponse;
  } catch (err) {
    Loading.hide();
    console.error(err);
    throw err;
  }
}

/**
 * Get loyalty points
 */
export async function fetchLoyaltyPoints({ rootState }) {
  try {
    const userId = rootState.profile.user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${process.env.VUE_APP_API_URL}/loyalty?userId=${userId}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch loyalty points");
    }

    return data;
  } catch (err) {
    console.error("Error fetching loyalty points:", err);
    throw err;
  }
}

import Booking from "../../shared/models/BookingClass";
import Flight from "../../shared/models/FlightClass"; // eslint-disable-line
// @ts-ignore
import { Loading } from "quasar";
import { processPayment } from "./payment";

/**
 *
 * Booking [Vuex Module Action](https://vuex.vuejs.org/guide/actions.html) - fetchBooking retrieves all bookings for current authenticated customer.
 *
 * It uses SET_BOOKINGS mutation to update Booking state with the latest bookings and flights associated with them.
 * @param {object} context - Vuex action context (context.commit, context.getters, context.state, context.dispatch)
 * @param {string} paginationToken - pagination token for loading additional bookings
 * @returns {promise} - Promise representing whether bookings from Booking service have been updated in the store
 * @see {@link SET_BOOKINGS} for more info on mutation
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
    const userId = rootState.profile.user?.id || rootGetters["profile/userAttributes"]?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    let url = `${process.env.VUE_APP_API_URL}/bookings?userId=${userId}`;
    if (paginationToken) {
      url += `&paginationToken=${paginationToken}`;
    }

    console.log("Fetching booking data from:", url);
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch bookings');
    }

    // Transform the API response to match your existing Booking class structure
    const bookings = data.bookings.map(booking => {
      // Create a booking object that matches your existing structure
      const bookingData = {
        id: booking.bookingId,
        bookingReference: booking.bookingId,
        status: booking.status?.toUpperCase() || 'CONFIRMED',
        customer: booking.userId,
        createdAt: booking.createdAt,
        outboundFlight: {
          id: booking.flightId,
          departureDate: booking.flightDetails.departure,
          departureAirportCode: booking.flightDetails.from,
          departureAirportName: `Airport ${booking.flightDetails.from}`,
          departureCity: booking.flightDetails.from,
          arrivalDate: booking.flightDetails.arrival,
          arrivalAirportCode: booking.flightDetails.to,
          arrivalAirportName: `Airport ${booking.flightDetails.to}`,
          arrivalCity: booking.flightDetails.to,
          ticketPrice: booking.totalPrice,
          ticketCurrency: 'USD',
          flightNumber: booking.flightDetails.flightNumber || 'Unknown',
          airline: booking.flightDetails.airline,
          seatCapacity: booking.flightDetails.seats || 180
        },
        checkedIn: false,
        paymentToken: 'mock_payment_token' // Since we're using mock payments
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
 *
 * Booking [Vuex Module Action](https://vuex.vuejs.org/guide/actions.html) - createBooking attempts payment charge via Payment service, and it effectively books a flight if payment is accepted.
 *
 * **NOTE**: It doesn't mutate the store
 * @param {object} context - Vuex action context (context.commit, context.getters, context.state, context.dispatch)
 * @param {object} obj - Object containing params required to create a booking
 * @param {object} obj.paymentToken - Stripe JS Payment token object
 * @param {Flight} obj.outboundFlight - Outbound Flight
 * @returns {promise} - Promise representing booking effectively made in the Booking service.
 */
export async function createBooking(
  { commit, rootState },
  { paymentToken, outboundFlight }
) {
  console.group("store/bookings/actions/createBooking");
  try {
    const userId = rootState.profile.user?.id;
    const customerEmail = rootState.profile.user?.attributes?.email || rootState.profile.user?.email;

    if (!userId) {
      throw new Error('User not authenticated');
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
          firstName: rootState.profile.user?.firstName || 'Customer',
          lastName: rootState.profile.user?.lastName || 'User',
          email: customerEmail
        }
      ],
      contactInfo: {
        email: customerEmail,
        phone: '+1234567890' // You might want to get this from user profile
      }
    };

    console.log("Booking data:", bookingData);

    const response = await fetch(`${process.env.VUE_APP_API_URL}/booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create booking');
    }

    console.log(`Booking created successfully: ${data.bookingId}`);
    
    // Transform the response to match your existing structure
    const bookingResponse = {
      id: data.bookingId,
      bookingReference: data.bookingId,
      status: 'CONFIRMED',
      // Add other fields as needed
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
 * New action to get loyalty points
 */
export async function fetchLoyaltyPoints({ rootState }) {
  try {
    const userId = rootState.profile.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${process.env.VUE_APP_API_URL}/loyalty?userId=${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch loyalty points');
    }

    return data;
  } catch (err) {
    console.error('Error fetching loyalty points:', err);
    throw err;
  }
}

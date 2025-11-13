import { Loading } from "quasar";

const BOOKINGS_API_URL = "https://uqeubfps3l.execute-api.ap-south-1.amazonaws.com/prod";

export async function createBooking({ commit, rootState }, { outboundFlight, passengers, contactInfo, userId }) {
  console.group("CREATE BOOKING");
  Loading.show({ message: "Creating booking..." });

  try {
    const user = rootState.profile?.user;
    const actualUserId = userId || user?.id || user?.sub || user?.username;
    
    console.log("User from profile:", user);
    console.log("Extracted user ID:", actualUserId); // ✅ FIXED: Changed : to ;

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

    if (result.success && result.booking) {
      const transformedBooking = {
        ...result.booking,
        id: result.booking.id || result.bookingId,
        bookingReference: result.booking.bookingReference || result.bookingId,
        
        // Ensure outboundFlight has proper data
        outboundFlight: {
          id: result.booking.outboundFlight?.id || outboundFlight.id,
          departureAirportCode: result.booking.outboundFlight?.departureAirportCode || outboundFlight.departureAirportCode,
          arrivalAirportCode: result.booking.outboundFlight?.arrivalAirportCode || outboundFlight.arrivalAirportCode,
          departureDate: result.booking.outboundFlight?.departureDate || outboundFlight.departureDate,
          arrivalDate: result.booking.outboundFlight?.arrivalDate || outboundFlight.arrivalDate,
          departureAirportName: result.booking.outboundFlight?.departureAirportName || outboundFlight.departureAirportName,
          arrivalAirportName: result.booking.outboundFlight?.arrivalAirportName || outboundFlight.arrivalAirportName,
          airline: result.booking.outboundFlight?.airline || outboundFlight.airline,
          ticketPrice: result.booking.outboundFlight?.ticketPrice || outboundFlight.ticketPrice,
          ticketCurrency: result.booking.outboundFlight?.ticketCurrency || outboundFlight.ticketCurrency,
          flightNumber: result.booking.outboundFlight?.flightNumber || outboundFlight.flightNumber,
          duration: result.booking.outboundFlight?.duration || outboundFlight.duration
        }
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
      // ✅ FIXED: Properly extract flight data from outboundFlight
      const transformedBookings = result.bookings.map(booking => {
        console.log("Raw booking from API:", booking);
        
        // Extract flight data from outboundFlight object
        const outboundFlight = booking.outboundFlight || {};
        
        const transformed = {
          // Preserve all original booking data
          id: booking.id,
          bookingReference: booking.bookingReference,
          status: booking.status,
          totalPrice: booking.totalPrice,
          passengers: booking.passengers,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          paymentStatus: booking.paymentStatus,
          userId: booking.userId,
          flightId: booking.flightId,
          
          // ✅ PROPERLY TRANSFORM FLIGHT DATA from outboundFlight
          outboundFlight: {
            id: outboundFlight.id || booking.flightId,
            departureAirportCode: outboundFlight.departureAirportCode,
            arrivalAirportCode: outboundFlight.arrivalAirportCode,
            departureDate: outboundFlight.departureDate,
            arrivalDate: outboundFlight.arrivalDate,
            departureAirportName: outboundFlight.departureAirportName || `${outboundFlight.departureAirportCode} Airport`,
            arrivalAirportName: outboundFlight.arrivalAirportName || `${outboundFlight.arrivalAirportCode} Airport`,
            airline: outboundFlight.airline,
            ticketPrice: outboundFlight.ticketPrice,
            ticketCurrency: outboundFlight.ticketCurrency || "EUR",
            flightNumber: outboundFlight.flightNumber,
            duration: outboundFlight.duration
          }
        };
        
        console.log("✅ Transformed booking flight data:", transformed.outboundFlight);
        return transformed;
      });
      
      console.log("🎯 Final transformed bookings:", transformedBookings);
      commit("SET_BOOKINGS", transformedBookings);
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

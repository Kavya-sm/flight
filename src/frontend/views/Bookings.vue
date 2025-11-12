<template>
  <q-page>
    <div class="wrapper">
      <div class="q-display-1 text-primary booking__heading">
        Bookings
      </div>
    </div>

    <!-- Debug button to help see the data -->
    <div class="wrapper text-center q-mb-md">
      <q-btn 
        @click="debugBookings" 
        label="Debug Bookings Data" 
        color="warning" 
        size="sm"
        class="q-mb-md"
      />
    </div>
    
    <div class="bookings">
      <q-timeline color="secondary" class="q-pl-md">
        <div class="booking" v-for="booking in normalizedBookings" :key="booking.id">
          <q-timeline-entry class="booking__entry" icon="flight_takeoff" side="left">
            <h5 slot="subtitle" class="q-timeline-subtitle">
              <span v-if="booking.flight.departureAirportCode && booking.flight.arrivalAirportCode">
                {{ booking.flight.departureAirportCode }} → {{ booking.flight.arrivalAirportCode }} &mdash;
                {{ formatDate(booking.flight.departureDate) }}
              </span>
              <span v-else class="text-warning">
                Flight details loading...
              </span>
            </h5>
            <booking-flight
              :bookingID="booking.bookingID"
              :flight="booking.flight"
            />
          </q-timeline-entry>
        </div>
      </q-timeline>
      
      <div v-if="normalizedBookings.length === 0" class="wrapper text-center q-mt-lg">
        <q-icon name="flight" size="4rem" color="grey-5" />
        <div class="q-title q-mt-md text-grey-6">No bookings yet</div>
        <div class="q-subtitle text-grey-6">Book your first flight to see it here!</div>
      </div>
    </div>
  </q-page>
</template>

<script>
import BookingFlight from "../components/BookingFlight";
import { mapState, mapGetters } from "vuex";

export default {
  name: "Bookings",
  components: { BookingFlight },
  
  mounted() {
    if (this.isAuthenticated) {
      this.loadBookings();
    }
  },
  
  methods: {
    async loadBookings() {
      try {
        await this.$store.dispatch("bookings/fetchBookings");
      } catch (error) {
        console.error("Failed to load bookings:", error);
        this.$q.notify({
          type: "negative",
          message: "Error loading bookings",
          timeout: 3000
        });
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Unknown date';
      try {
        return new Date(dateString).toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch (e) {
        return dateString;
      }
    },

    // Debug method to see the actual data structure
    debugBookings() {
      console.group("🔍 BOOKINGS DEBUG INFO");
      console.log("Raw bookings from Vuex:", this.bookings);
      if (this.bookings && this.bookings.length > 0) {
        console.log("First booking raw data:", this.bookings[0]);
        console.log("First booking outboundFlight:", this.bookings[0].outboundFlight);
        console.log("First booking normalized:", this.normalizedBookings[0]);
      } else {
        console.log("No bookings found");
      }
      console.groupEnd();

      // Show notification with basic info
      this.$q.notify({
        message: `Found ${this.bookings.length} booking(s) - check console for details`,
        color: 'info',
        timeout: 4000
      });
    }
  },
  
  computed: {
    ...mapState({
      bookings: state => state.bookings.bookings
    }),
    ...mapGetters("profile", ["isAuthenticated"]),

    // Normalize the booking data to match what the template expects
    normalizedBookings() {
      if (!this.bookings || !Array.isArray(this.bookings)) {
        return [];
      }

      return this.bookings.map(booking => {
        // The API returns flight data in outboundFlight, but template expects it in flight
        const outboundFlight = booking.outboundFlight || {};
        
        return {
          // Keep the original booking ID
          id: booking.id,
          bookingID: booking.bookingReference || booking.id,
          
          // Transform the flight data to match what BookingFlight component expects
          flight: {
            // Airport codes - handle both nested and flat structures
            departureAirportCode: outboundFlight.departureAirport?.code || 
                                outboundFlight.departureAirportCode || 
                                'Unknown',
            arrivalAirportCode: outboundFlight.arrivalAirport?.code || 
                              outboundFlight.arrivalAirportCode || 
                              'Unknown',
            
            // Dates
            departureDate: outboundFlight.departureTime || 
                          outboundFlight.departureDate,
            arrivalDate: outboundFlight.arrivalTime || 
                        outboundFlight.arrivalDate,
            
            // Other flight details that might be needed
            flightNumber: outboundFlight.flightNumber,
            price: outboundFlight.price || booking.totalPrice,
            duration: outboundFlight.duration,
            
            // Include the entire outboundFlight object for backward compatibility
            ...outboundFlight
          },
          
          // Include original booking properties
          ...booking
        };
      });
    }
  }
};
</script>

<style lang="stylus">
@import '~variables'

.booking__heading
  margin-top 2rem

.booking__flight
  margin 0 !important
  margin-right 1rem !important

.booking__entry
  padding-left 2rem

.wrapper
  padding 0 1rem
</style>

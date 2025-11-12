<template>
  <q-page>
    <div class="wrapper">
      <div class="q-display-1 text-primary booking__heading">
        Bookings
      </div>
    </div>

    <!-- Debug button -->
    <div class="wrapper text-center">
      <q-btn 
        @click="debugBookings" 
        label="Debug Bookings" 
        color="warning" 
        class="q-mb-md" 
        size="sm"
      />
    </div>
    
    <div class="bookings">
      <q-timeline color="secondary" class="q-pl-md">
        <div class="booking" v-for="booking in normalizedBookings" :key="booking.id">
          <q-timeline-entry class="booking__entry" icon="flight_takeoff" side="left">
            <h5 slot="subtitle" class="q-timeline-subtitle">
              <span>
                {{ booking.flight.departureAirportCode }} → 
                {{ booking.flight.arrivalAirportCode }} &mdash;
                {{ formatDate(booking.flight.departureDate) }}
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
      this.loadBookings().then(() => {
        // Auto-debug to see the data structure
        this.debugBookings();
      });
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

    debugBookings() {
      console.group("📦 BOOKINGS DEBUG INFO");
      console.log("All bookings raw data:", this.bookings);
      if (this.bookings.length > 0) {
        console.log("First booking details:", this.bookings[0]);
        console.log("First booking outboundFlight:", this.bookings[0].outboundFlight);
        console.log("First booking normalized:", this.normalizedBookings[0]);
      }
      console.groupEnd();
      
      // Show in UI as well
      if (this.bookings.length > 0) {
        this.$q.notify({
          message: `Found ${this.bookings.length} booking(s). Check console for details.`,
          color: 'info',
          timeout: 4000
        });
      }
    }
  },
  
  computed: {
    ...mapState({
      bookings: state => state.bookings.bookings
    }),
    ...mapGetters("profile", ["isAuthenticated"]),
    
    // Normalize the booking data to match the expected template structure
    normalizedBookings() {
      return this.bookings.map(booking => {
        // Handle different possible data structures
        const outboundFlight = booking.outboundFlight || booking.flight || {};
        const departureAirport = outboundFlight.departureAirport || {};
        const arrivalAirport = outboundFlight.arrivalAirport || {};
        
        return {
          id: booking.id || booking.bookingID,
          bookingID: booking.bookingReference || booking.id,
          flight: {
            // Airport codes
            departureAirportCode: departureAirport.code || outboundFlight.departureAirportCode || 'Unknown',
            arrivalAirportCode: arrivalAirport.code || outboundFlight.arrivalAirportCode || 'Unknown',
            
            // Airport names (if needed)
            departureAirportName: departureAirport.name || outboundFlight.departureAirportName,
            arrivalAirportName: arrivalAirport.name || outboundFlight.arrivalAirportName,
            
            // Dates and times
            departureDate: outboundFlight.departureTime || outboundFlight.departureDate,
            arrivalDate: outboundFlight.arrivalTime || outboundFlight.arrivalDate,
            
            // Flight details
            flightNumber: outboundFlight.flightNumber,
            price: outboundFlight.price,
            duration: outboundFlight.duration,
            
            // Include the original outboundFlight for components that need it
            ...outboundFlight
          },
          // Include original booking data
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

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
        label="Debug Bookings Data" 
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
              <span v-if="booking.flight.departureAirportCode && booking.flight.arrivalAirportCode">
                {{ booking.flight.departureAirportCode }} → {{ booking.flight.arrivalAirportCode }} &mdash;
                {{ formatDate(booking.flight.departureDate) }}
              </span>
              <span v-else class="text-warning">
                Flight details loading...
              </span>
            </h5>
            <!-- Remove BookingFlight component if it's causing duplicates -->
            <!-- <booking-flight
              :bookingID="booking.bookingID"
              :flight="booking.flight"
            /> -->
            
            <!-- Instead, show simple flight details -->
            <div class="booking-details q-pa-md">
              <div class="row items-center">
                <div class="col-6 text-center">
                  <div class="text-h4 text-primary">{{ booking.flight.departureAirportCode }}</div>
                  <div class="text-caption">{{ booking.flight.departureAirportName || 'Departure' }}</div>
                  <div class="text-caption text-weight-medium">{{ formatTime(booking.flight.departureDate) }}</div>
                </div>
                <div class="col-6 text-center">
                  <div class="text-h4 text-primary">{{ booking.flight.arrivalAirportCode }}</div>
                  <div class="text-caption">{{ booking.flight.arrivalAirportName || 'Arrival' }}</div>
                  <div class="text-caption text-weight-medium">{{ formatTime(booking.flight.arrivalDate) }}</div>
                </div>
              </div>
              <div class="row justify-center q-mt-sm">
                <div class="text-caption text-grey">
                  Flight {{ booking.flight.flightNumber }} • 
                  {{ booking.flight.duration || 'Duration not available' }}
                </div>
              </div>
              <div class="row justify-center q-mt-sm">
                <q-btn 
                  label="View Details" 
                  color="primary" 
                  size="sm" 
                  outline
                  @click="viewBookingDetails(booking)"
                />
              </div>
            </div>
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
// import BookingFlight from "../components/BookingFlight"; // Remove this import
import { mapState, mapGetters } from "vuex";

export default {
  name: "Bookings",
  components: { 
    // BookingFlight // Remove this component
  },
  
  mounted() {
    if (this.isAuthenticated) {
      this.loadBookings().then(() => {
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

    formatTime(dateString) {
      if (!dateString) return '--:--';
      try {
        return new Date(dateString).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
      } catch (e) {
        return '--:--';
      }
    },

    viewBookingDetails(booking) {
      console.log('Booking details:', booking);
      this.$q.notify({
        message: `Booking ${booking.bookingID} details`,
        color: 'info',
        timeout: 2000
      });
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
    
    normalizedBookings() {
      return this.bookings.map(booking => {
        const outboundFlight = booking.outboundFlight || {};
        const departureAirport = outboundFlight.departureAirport || {};
        const arrivalAirport = outboundFlight.arrivalAirport || {};
        
        return {
          id: booking.id,
          bookingID: booking.bookingReference || booking.id,
          flight: {
            departureAirportCode: departureAirport.code || outboundFlight.departureAirportCode || 'Unknown',
            arrivalAirportCode: arrivalAirport.code || outboundFlight.arrivalAirportCode || 'Unknown',
            departureAirportName: departureAirport.name || outboundFlight.departureAirportName,
            arrivalAirportName: arrivalAirport.name || outboundFlight.arrivalAirportName,
            departureDate: outboundFlight.departureTime || outboundFlight.departureDate,
            arrivalDate: outboundFlight.arrivalTime || outboundFlight.arrivalDate,
            flightNumber: outboundFlight.flightNumber,
            price: outboundFlight.price || booking.totalPrice,
            duration: outboundFlight.duration,
            ...outboundFlight
          },
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

.booking-details
  background: $grey-1
  border-radius: 8px
  margin-top: 8px

.wrapper
  padding 0 1rem
</style>

<template>
  <q-page>
    <div class="wrapper">
      <div class="q-display-1 text-primary booking__heading">
        Bookings
      </div>
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
            
            <!-- Simple flight details display -->
            <div class="booking-details q-pa-md" v-if="booking.flight.departureAirportCode !== 'Unknown'">
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
                  Booking Ref: {{ booking.bookingID }}
                </div>
              </div>
              <div class="row justify-center q-mt-sm">
                <div class="text-caption text-grey">
                  Total: ${{ booking.flight.price || booking.totalPrice || 'N/A' }}
                </div>
              </div>
            </div>
            
            <div v-else class="booking-details q-pa-md text-warning text-center">
              <q-icon name="warning" class="q-mr-sm" />
              Flight details not available
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
import { mapState, mapGetters } from "vuex";

export default {
  name: "Bookings",
  components: { },
  
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
    }
  },
  
  computed: {
    ...mapState({
      bookings: state => state.bookings.bookings
    }),
    ...mapGetters("profile", ["isAuthenticated"]),
    
    normalizedBookings() {
      if (!this.bookings || !Array.isArray(this.bookings)) {
        return [];
      }

      return this.bookings.map(booking => {
        // For existing bookings, flight data should be in outboundFlight
        const flightData = booking.outboundFlight || {};
        
        // Extract airport data from various possible structures
        const departureAirport = flightData.departureAirport || {};
        const arrivalAirport = flightData.arrivalAirport || {};
        
        return {
          id: booking.id,
          bookingID: booking.bookingReference || booking.id,
          flight: {
            departureAirportCode: departureAirport.code || 
                                flightData.departureAirportCode || 
                                'Unknown',
            arrivalAirportCode: arrivalAirport.code || 
                              flightData.arrivalAirportCode || 
                              'Unknown',
            departureAirportName: departureAirport.name || 
                                flightData.departureAirportName,
            arrivalAirportName: arrivalAirport.name || 
                              flightData.arrivalAirportName,
            departureDate: flightData.departureTime || 
                          flightData.departureDate ||
                          booking.createdAt,
            arrivalDate: flightData.arrivalTime || 
                        flightData.arrivalDate,
            flightNumber: flightData.flightNumber,
            price: flightData.price || booking.totalPrice,
            duration: flightData.duration
          }
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

.booking__entry
  padding-left 2rem

.booking-details
  background: $grey-1
  border-radius: 8px
  margin-top: 8px

.wrapper
  padding 0 1rem
</style>

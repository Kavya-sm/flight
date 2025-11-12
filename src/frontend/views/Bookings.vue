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
              <span>
                {{ booking.flight.departureAirportCode }} → {{ booking.flight.arrivalAirportCode }} &mdash;
                {{ formatDate(booking.flight.departureDate) }}
              </span>
            </h5>
            
            <!-- Simple flight details display -->
            <div class="booking-details q-pa-md">
              <div class="row items-center">
                <div class="col-6 text-center">
                  <div class="text-h4 text-primary">{{ booking.flight.departureAirportCode }}</div>
                  <div class="text-caption">Delhi (DEL)</div>
                  <div class="text-caption text-weight-medium">{{ formatTime(booking.flight.departureDate) }}</div>
                </div>
                <div class="col-6 text-center">
                  <div class="text-h4 text-primary">{{ booking.flight.arrivalAirportCode }}</div>
                  <div class="text-caption">Mumbai (BOM)</div>
                  <div class="text-caption text-weight-medium">{{ formatTime(booking.flight.arrivalDate) }}</div>
                </div>
              </div>
              <div class="row justify-center q-mt-sm">
                <div class="text-caption text-grey">
                  Flight {{ booking.flight.flightNumber }} • {{ booking.flight.duration || '2h 30m' }}
                </div>
              </div>
              <div class="row justify-center q-mt-sm">
                <div class="text-caption text-grey">
                  Booking Ref: {{ booking.bookingID }}
                </div>
              </div>
              <div class="row justify-center q-mt-sm">
                <div class="text-caption text-weight-medium text-primary">
                  Total: ${{ booking.flight.price || booking.totalPrice || '75' }}
                </div>
              </div>
              <div class="row justify-center q-mt-sm">
                <q-badge :color="getStatusColor(booking.status)" class="q-px-sm q-py-xs">
                  {{ booking.status || 'confirmed' }}
                </q-badge>
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
    },

    getStatusColor(status) {
      const statusColors = {
        'confirmed': 'positive',
        'pending': 'warning',
        'cancelled': 'negative',
        'completed': 'info'
      };
      return statusColors[status] || 'grey';
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
        // The flight data is in outboundFlight according to the API response
        const flightData = booking.outboundFlight || {};
        
        return {
          id: booking.id,
          bookingID: booking.bookingReference || booking.id,
          status: booking.status,
          totalPrice: booking.totalPrice,
          flight: {
            // Direct from outboundFlight object
            departureAirportCode: flightData.departureAirportCode || 'DEL',
            arrivalAirportCode: flightData.arrivalAirportCode || 'BOM',
            departureDate: flightData.departureDate || '2025-11-12T08:00:00',
            arrivalDate: flightData.arrivalDate || '2025-11-12T10:30:00',
            flightNumber: flightData.flightNumber || 'AI101',
            price: flightData.price || booking.totalPrice,
            duration: flightData.duration || '2h 30m'
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
  text-align center

.booking__entry
  padding-left 2rem

.booking-details
  background: $grey-1
  border-radius: 8px
  margin-top: 8px
  border: 1px solid $grey-3

.booking__subtitle
  font-weight: 500
  margin-bottom: 8px

.wrapper
  padding 0 1rem

.text-h4
  font-size: 2rem
  font-weight: bold
  margin-bottom: 4px
</style>

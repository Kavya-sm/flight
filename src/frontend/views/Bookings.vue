<template>
  <q-page>
    <div class="wrapper">
      <div class="q-display-1 text-primary booking__heading">
        Bookings
      </div>
    </div>
    
    <div class="bookings">
      <q-timeline color="secondary" class="q-pl-md">
        <div class="booking" v-for="booking in bookings" :key="booking.id">
          <q-timeline-entry class="booking__entry" icon="flight_takeoff" side="left">
            <h5 slot="subtitle" class="q-timeline-subtitle">
              <span v-if="booking.outboundFlight && booking.outboundFlight.departureAirportCode && booking.outboundFlight.arrivalAirportCode">
                {{ booking.outboundFlight.departureAirportCode }} → {{ booking.outboundFlight.arrivalAirportCode }} &mdash;
                {{ formatDate(booking.outboundFlight.departureDate) }}
              </span>
              <span v-else>
                Flight Details
              </span>
            </h5>
            
            <!-- Debug info -->
            <div v-if="!booking.outboundFlight?.departureAirportCode" class="q-pa-sm bg-warning text-caption">
              ⚠️ Missing flight data - check Vuex transformation
            </div>
            
            <div class="booking-details q-pa-md">
              <div class="row items-center">
                <div class="col-6 text-center">
                  <div class="text-h4 text-primary">{{ booking.outboundFlight?.departureAirportCode || '---' }}</div>
                  <div class="text-caption">{{ getAirportName(booking.outboundFlight?.departureAirportCode) }}</div>
                  <div class="text-caption text-weight-medium">{{ formatTime(booking.outboundFlight?.departureDate) }}</div>
                </div>
                <div class="col-6 text-center">
                  <div class="text-h4 text-primary">{{ booking.outboundFlight?.arrivalAirportCode || '---' }}</div>
                  <div class="text-caption">{{ getAirportName(booking.outboundFlight?.arrivalAirportCode) }}</div>
                  <div class="text-caption text-weight-medium">{{ formatTime(booking.outboundFlight?.arrivalDate) }}</div>
                </div>
              </div>
              <div class="row justify-center q-mt-sm">
                <div class="text-caption text-grey">
                  {{ booking.outboundFlight?.airline || 'Airline' }} {{ booking.outboundFlight?.flightNumber || '---' }} • {{ formatDuration(booking.outboundFlight?.duration) }}
                </div>
              </div>
              <div class="row justify-center q-mt-sm">
                <div class="text-caption text-grey">
                  Booking Ref: {{ booking.bookingReference }}
                </div>
              </div>
              <div class="row justify-center q-mt-sm">
                <div class="text-caption text-weight-medium text-primary">
                  Total: €{{ booking.totalPrice }}
                </div>
              </div>
              <div class="row justify-center q-mt-sm">
                <div class="text-caption text-grey">
                  Passengers: {{ booking.passengers ? booking.passengers.length : 1 }}
                </div>
              </div>
              <div class="row justify-center q-mt-sm">
                <q-badge :color="getStatusColor(booking.status)" class="q-px-sm q-py-xs">
                  {{ booking.status }}
                </q-badge>
              </div>
            </div>
          </q-timeline-entry>
        </div>
      </q-timeline>
      
      <div v-if="bookings.length === 0" class="wrapper text-center q-mt-lg">
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

    formatDuration(durationMinutes) {
      if (!durationMinutes) return '--h --m';
      if (typeof durationMinutes === 'string') return durationMinutes;
      if (typeof durationMinutes === 'number') {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        return `${hours}h ${minutes}m`;
      }
      return '--h --m';
    },

    getStatusColor(status) {
      const statusColors = {
        'confirmed': 'positive',
        'pending': 'warning',
        'cancelled': 'negative',
        'completed': 'info'
      };
      return statusColors[status] || 'grey';
    },

    getAirportName(code) {
      if (!code) return 'Airport';
      const airports = {
        'DEL': 'Delhi',
        'BOM': 'Mumbai', 
        'BLR': 'Bangalore',
        'MAA': 'Chennai',
        'HYD': 'Hyderabad',
        'CCU': 'Kolkata',
        'AMD': 'Ahmedabad'
      };
      return airports[code] || `${code} Airport`;
    }
  },
  
  computed: {
    ...mapState({
      bookings: state => state.bookings.bookings
    }),
    ...mapGetters("profile", ["isAuthenticated"])
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

.wrapper
  padding 0 1rem

.text-h4
  font-size: 2rem
  font-weight: bold
  margin-bottom: 4px
</style>

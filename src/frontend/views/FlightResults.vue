<template>
  <q-page class="container">
    <flight-toolbar
      v-if="date && departure && arrival"
      :departure="departure"
      :arrival="arrival"
    />
    <q-page-sticky
      v-if="date && departure && arrival"
      position="top-right"
      :offset="[15, 13]"
    >
      <q-fab flat icon="tune" direction="left">
        <q-fab-action color="secondary" icon="attach_money" glossy>
          <q-popup-edit
            @save="setPrice"
            title="Max Price filter"
            buttons
            v-model="maxPriceFilter"
          >
            <q-slider
              color="secondary"
              :min="minimumPrice"
              :max="maximumPrice"
              label
              label-always
              v-model="maxPriceFilter"
              class="filter__price"
            />
          </q-popup-edit>
        </q-fab-action>
        <q-fab-action color="secondary" icon="schedule" glossy>
          <q-popup-edit title="Schedule filter" buttons v-model="timeFilterModel">
            <div class="time-filters q-pa-md">
              <div class="text-subtitle1 q-mb-md">Departure Time</div>
              <q-datetime
                type="time"
                format24h
                placeholder="Depart after"
                clearable
                v-model="departureTimeFilter"
                class="filter__departure q-mb-md full-width"
              />
              <div class="text-subtitle1 q-mb-md">Arrival Time</div>
              <q-datetime
                type="time"
                format24h
                placeholder="Arrive before"
                clearable
                v-model="arrivalTimeFilter"
                class="filter__arrival full-width"
              />
            </div>
          </q-popup-edit>
        </q-fab-action>
        <q-fab-action
          color="secondary"
          icon="cancel"
          @click="resetFilters"
          glossy
          class="filter__cta"
        />
      </q-fab>
    </q-page-sticky>
    <div class="heading">
      <div class="q-headline text-primary text-center">
        <div class="loader" v-if="loading">
          <flight-loader></flight-loader>
        </div>
        <div v-if="filteredFlights.length && !loading">
          <span class="results__headline" data-test="results-headline"
            >Select your flight ({{ filteredFlights.length }} found from {{ departure }} to {{ arrival }})</span
          >
        </div>
        <div
          v-if="!filteredFlights.length && !loading"
          class="heading__error row"
        >
          <span
            class="justify-center full-width results__error"
            data-test="results-error"
            >No flights found from {{ departure }} to {{ arrival }}</span
          >
          <transition enter-active-class="animated bounce" appear>
            <q-btn
              class="cta__button heading__error--cta"
              color="secondary"
              label="Search flights"
              icon="keyboard_arrow_left"
              :to="{ name: 'home' }"
            >
            </q-btn>
          </transition>
        </div>
      </div>
    </div>
    <div class="results__flights" v-if="filteredFlights.length && !loading">
      <router-link
        :to="{
          name: 'selectedFlight',
          params: { flight: flight },
          query: { flightId: flight.id }
        }"
        v-for="flight in filteredFlights"
        :key="flight.id"
      >
        <flight-card :details="flight" />
      </router-link>
    </div>
    <div class="wrapper">
      <q-btn
        v-if="paginationToken"
        @click="loadFlights"
        class="cta__button"
        color="secondary"
        size="1rem"
        label="Load more flights?"
        data-test="flight-pagination"
      />
    </div>
  </q-page>
</template>

<script>
// @ts-nocheck
import FlightCard from "../components/FlightCard";
import FlightToolbar from "../components/FlightToolbar";
import FlightLoader from "../components/FlightLoader";
import { mapState, mapGetters } from "vuex";
import { priceFilter, scheduleFilter } from "../shared/mixins/filters";
import { priceSorter, scheduleSorter } from "../shared/mixins/sorters";

export default {
  name: "FlightResults",
  components: {
    FlightCard,
    FlightToolbar,
    FlightLoader
  },
  mixins: [priceFilter, scheduleFilter, priceSorter, scheduleSorter],
  props: {
    date: { type: String, required: true },
    departure: { type: String, required: true },
    arrival: { type: String, required: true }
  },
  data() {
    return {
      filteredFlights: [],
      departureTimeFilter: null,
      arrivalTimeFilter: null,
      maxPriceFilter: 300,
      timeFilterModel: "time" // Dummy model for popup
    };
  },
  mounted() {
    if (this.isAuthenticated) {
      this.loadFlights();
    }
  },
  watch: {
    // Watch for time filter changes and apply filters automatically
    departureTimeFilter(newVal) {
      this.applyTimeFilters();
    },
    arrivalTimeFilter(newVal) {
      this.applyTimeFilters();
    },
    // Reload flights when route parameters change
    '$route.query': {
      handler(newQuery) {
        if (this.isAuthenticated && newQuery.departure && newQuery.arrival) {
          this.loadFlights();
        }
      },
      immediate: true
    }
  },
  methods: {
    async loadFlights() {
      try {
        if (this.isAuthenticated) {
          console.log("Loading flights with params:", {
            date: this.date,
            departure: this.departure,
            arrival: this.arrival
          });

          await this.$store.dispatch("catalog/fetchFlights", {
            date: this.date,
            departure: this.departure,
            arrival: this.arrival,
            paginationToken: this.paginationToken
          });

          // Apply any existing filters when loading new flights
          this.applyAllFilters();
        }
      } catch (error) {
        console.error("Error loading flights:", error);
        this.$q.notify(
          `Error while fetching Flight results - Check browser console messages`
        );
      }
    },

    applyAllFilters() {
      let flights = this.uniqueFlights;
      
      // Apply price filter
      flights = this.filterByMaxPrice(flights, this.maxPriceFilter);
      
      // Apply time filters
      flights = this.applyTimeFiltersToFlights(flights);
      
      this.filteredFlights = this.sortByDeparture(flights);
    },

    applyTimeFilters() {
      let flights = this.uniqueFlights;
      
      // Apply price filter first
      flights = this.filterByMaxPrice(flights, this.maxPriceFilter);
      
      // Apply time filters
      flights = this.applyTimeFiltersToFlights(flights);
      
      this.filteredFlights = this.sortByDeparture(flights);
    },

    applyTimeFiltersToFlights(flights) {
      if (this.departureTimeFilter || this.arrivalTimeFilter) {
        return this.filterBySchedule(flights, {
          departure: this.departureTimeFilter,
          arrival: this.arrivalTimeFilter
        });
      }
      return flights;
    },

    setPrice() {
      this.applyAllFilters();
    },

    resetFilters() {
      this.departureTimeFilter = null;
      this.arrivalTimeFilter = null;
      this.maxPriceFilter = 300;
      this.filteredFlights = this.sortByDeparture(this.uniqueFlights);
    }
  },
  computed: {
    ...mapState({
      flights: state => state.catalog.flights,
      loading: state => state.catalog.loading,
      paginationToken: state => state.catalog.paginationToken
    }),
    ...mapGetters("profile", ["isAuthenticated"]),
    
    uniqueFlights() {
      return this.flights.filter((flight, index, self) => 
        index === self.findIndex(f => f.id === flight.id)
      );
    },
    
    maximumPrice: function() {
      const prices = this.uniqueFlights.map(filter => filter.ticketPrice);
      return prices.length > 0 ? Math.max(...prices) : 500;
    },
    minimumPrice: function() {
      const prices = this.uniqueFlights.map(filter => filter.ticketPrice);
      return prices.length > 0 ? Math.min(...prices) : 1;
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables'

.heading
  margin-top 5.5rem

.heading__error--cta
  margin auto
  margin-top 10vh
  width 70vw

.loader
  width 150%

.time-filters
  min-width: 300px
  
.filter__departure,
.filter__arrival
  width: 100%
</style>

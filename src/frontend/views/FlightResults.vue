<template>
  <q-page class="container">
    <flight-toolbar
      v-if="date && departure && arrival"
      :departure="departure"
      :arrival="arrival"
    />

    <div class="heading">
      <div class="q-headline text-primary text-center">
        <div class="loader" v-if="loading">
          <flight-loader></flight-loader>
        </div>

        <div v-if="filteredFlights.length && !loading">
          <span class="results__headline">Select your flight</span>
        </div>

        <div v-if="!filteredFlights.length && !loading" class="heading__error row">
          <span class="justify-center full-width results__error">
            No results found
          </span>
          <transition enter-active-class="animated bounce" appear>
            <q-btn
              class="cta__button heading__error--cta"
              color="secondary"
              label="Search flights"
              icon="keyboard_arrow_left"
              :to="{ name: 'home' }"
            />
          </transition>
        </div>
      </div>
    </div>

    <!-- Debug: raw data -->
    <pre v-if="!loading && flights.length">{{ flights }}</pre>

    <div class="results__flights" v-if="filteredFlights.length && !loading">
      <router-link
        v-for="flight in filteredFlights"
        :key="flight.id"
        :to="{
          name: 'selectedFlight',
          params: { flight: flight },
          query: { flightId: flight.id }
        }"
      >
        <flight-card :details="flight" />
      </router-link>
    </div>
  </q-page>
</template>

<script>
// @ts-nocheck
import FlightCard from "../components/FlightCard";
import FlightToolbar from "../components/FlightToolbar";
import FlightLoader from "../components/FlightLoader";
import { mapState } from "vuex";
import { priceFilter, scheduleFilter } from "../shared/mixins/filters";
import { priceSorter, scheduleSorter } from "../shared/mixins/sorters";

export default {
  name: "FlightResults",
  components: { FlightCard, FlightToolbar, FlightLoader },
  mixins: [priceFilter, scheduleFilter, priceSorter, scheduleSorter],

  props: {
    date: { type: String, required: true },
    departure: { type: String, required: true },
    arrival: { type: String, required: true }
  },

  data() {
    return {
      filteredFlights: [],
      departureTimeFilter: "",
      arrivalTimeFilter: "",
      maxPriceFilter: 300
    };
  },

  mounted() {
    this.loadFlights();
  },

  methods: {
    async loadFlights() {
      try {
        console.log("🔍 Loading flights for:", this.departure, "→", this.arrival);
        await this.$store.dispatch("catalog/fetchFlights", {
          departure: this.departure,
          arrival: this.arrival
        });

        console.log("🧭 Flights fetched from store:", this.flights);
        this.filteredFlights = this.sortByDeparture(this.flights);
      } catch (error) {
        console.error("❌ Error loading flights:", error);
        this.$q.notify("Error while fetching Flight results — check console");
      }
    },

    setPrice() {
      let flights = this.filterByMaxPrice(this.flights, this.maxPriceFilter);
      flights = this.sortByPrice(flights);
      this.filteredFlights = flights;
    },

    setDeparture() {
      let flights = this.filterBySchedule(this.flights, {
        departure: this.departureTimeFilter
      });
      flights = this.sortByDeparture(flights);
      this.filteredFlights = flights;
    },

    setArrival() {
      this.filteredFlights = this.filterBySchedule(this.flights, {
        arrival: this.arrivalTimeFilter
      });
    }
  },

  computed: {
    ...mapState({
      flights: state => state.catalog.flights,
      loading: state => state.catalog.loading,
      paginationToken: state => state.catalog.paginationToken
    }),

    maximumPrice() {
      return this.flights.length
        ? Math.max(...this.flights.map(f => f.ticketPrice))
        : 500;
    },
    minimumPrice() {
      return this.flights.length
        ? Math.min(...this.flights.map(f => f.ticketPrice))
        : 1;
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

.results__flights
  display flex
  flex-direction column
  align-items center
  gap 1rem
  margin-top 2rem
</style>


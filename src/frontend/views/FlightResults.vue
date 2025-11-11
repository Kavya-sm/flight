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
          <q-popup-edit title="Schedule filter">
            <q-datetime
              type="time"
              format24h
              format="HH:mm"
              format-model="date"
              placeholder="Depart at"
              clearable
              @input="setDeparture"
              v-model="departureTimeFilter"
              class="filter__departure"
            />
            <q-datetime
              type="time"
              format24h
              format="HH:mm"
              format-model="date"
              placeholder="Arrive by"
              clearable
              @input="setArrival"
              v-model="arrivalTimeFilter"
              class="filter__arrival"
            />
          </q-popup-edit>
        </q-fab-action>

        <q-fab-action
          color="secondary"
          icon="cancel"
          @click="filteredFlights = flights"
          glossy
          class="filter__cta"
        />
      </q-fab>
    </q-page-sticky>

    <!-- 🧭 Header Section -->
    <div class="heading">
      <div class="q-headline text-primary text-center">
        <div class="loader" v-if="loading">
          <flight-loader></flight-loader>
        </div>

        <div v-if="filteredFlights.length && !loading">
          <span class="results__headline" data-test="results-headline">
            Select your flight
          </span>
        </div>

        <div
          v-if="!filteredFlights.length && !loading"
          class="heading__error row"
        >
          <span
            class="justify-center full-width results__error"
            data-test="results-error"
          >
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

    <!-- 🧳 Flight Cards -->
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

    <!-- Pagination -->
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

/**
 * Flight Results view displays a collection of Flights from Catalog.
 */
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
      departureTimeFilter: "",
      arrivalTimeFilter: "",
      maxPriceFilter: 300
    };
  },
  mounted() {
    // ✅ Always load flights (don’t depend on authentication)
    this.loadFlights();
  },
  methods: {
    /**
     * Load flights from Vuex (Lambda backend)
     */
    async loadFlights() {
      try {
        console.log("🟢 Loading flights for:", this.departure, "→", this.arrival);

        await this.$store.dispatch("catalog/fetchFlights", {
          date: this.date,
          departure: this.departure,
          arrival: this.arrival,
          paginationToken: this.paginationToken
        });

        // ✅ Assign flights directly from store
        this.filteredFlights = this.flights;
        console.log("🟢 Flights loaded:", this.filteredFlights);
      } catch (error) {
        console.error("❌ Error loading flights:", error);
        this.$q.notify(
          `Error while fetching Flight results - Check browser console messages`
        );
      }
    },

    /**
     * Filter flights by max price
     */
    setPrice() {
      let flights = this.filterByMaxPrice(this.flights, this.maxPriceFilter);
      flights = this.sortByPrice(flights);
      this.filteredFlights = flights;
    },

    /**
     * Filter by departure schedule
     */
    setDeparture() {
      let flights = this.filterBySchedule(this.flights, {
        departure: this.departureTimeFilter
      });
      flights = this.sortByDeparture(flights);
      this.filteredFlights = flights;
    },

    /**
     * Filter by arrival schedule
     */
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
    ...mapGetters("profile", ["isAuthenticated"]),
    maximumPrice() {
      if (!this.flights.length) return 500;
      return Math.max(...this.flights.map(f => f.ticketPrice), 500);
    },
    minimumPrice() {
      if (!this.flights.length) return 1;
      return Math.min(...this.flights.map(f => f.ticketPrice), 1);
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
</style>


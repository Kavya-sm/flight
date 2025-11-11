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
    // Always load flights when page loads
    this.loadFlights();
  },

  methods: {
    async loadFlights() {
      try {
        console.log("✈️ Fetching flights for:", this.departure, "→", this.arrival);

        await this.$store.dispatch("catalog/fetchFlights", {
          date: this.date,
          departure: this.departure,
          arrival: this.arrival,
          paginationToken: this.paginationToken
        });

        console.log("✅ Flights fetched:", this.flights);
        this.filteredFlights = this.sortByDeparture(this.flights);
      } catch (error) {
        console.error("❌ Error loading flights:", error);
        this.$q.notify(`Error while fetching Flight results - Check console`);
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

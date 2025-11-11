<template>
  <q-page class="container">
    <div class="wrapper">
      <div class="heading">
        <div class="q-display-1 search__headline" data-test="search-headline">
          Where next?
        </div>
      </div>
    </div>

    <div class="search__options q-pa-sm">
      <!-- ✈️ Departure airport -->
      <q-field
        class="home-icons search__options--input search__departure"
        icon="flight_takeoff"
        icon-color="primary"
        :label-width="8"
      >
        <q-input
          class="search__departure"
          v-model="departureCity"
          stack-label="Departure airport"
          data-test="search-departure"
        >
          <q-autocomplete
            class="search__departure--suggestion text-bold"
            :min-characters="3"
            :static-data="{ field: 'city', list: suggestionList }"
            :filter="fuzzySearchFilter"
            value-field="sublabel"
            label-field="city"
            emit-value
            map-options
          />
        </q-input>
      </q-field>

      <!-- 🛬 Arrival airport -->
      <q-field
        class="home-icons search__options--input search__arrival"
        icon="flight_land"
        icon-color="primary"
        :label-width="8"
      >
        <q-input
          class="search__arrival"
          v-model="arrivalCity"
          stack-label="Arrival airport"
        >
          <q-autocomplete
            class="search__arrival--suggestion text-bold"
            :min-characters="3"
            :static-data="{ field: 'city', list: suggestionList }"
            :filter="fuzzySearchFilter"
            value-field="sublabel"
            label-field="city"
            emit-value
            map-options
          />
        </q-input>
      </q-field>

      <!-- 📅 Date picker -->
      <q-field
        icon="calendar_today"
        icon-color="primary"
        class="search__date search__options--input"
      >
        <q-datetime
          v-model="departureDate"
          type="date"
          format="ddd, DD MMM YYYY"
          stack-label="Pick a date"
        />
      </q-field>
    </div>

    <!-- 🔍 Search button -->
    <div class="wrapper">
      <q-btn
        @click="search"
        class="cta__button"
        color="secondary"
        label="Search flights"
        :disable="
          !$v.departureCity.required ||
          !$v.arrivalCity.required ||
          $v.departureCity.$invalid ||
          $v.arrivalCity.$invalid
        "
      >
        <q-icon
          class="cta__button--direction"
          name="keyboard_arrow_right"
          size="2.6rem"
        />
      </q-btn>
    </div>
  </q-page>
</template>

<script>
// @ts-nocheck
import airports from "../store/catalog/airports.json";
import Fuse from "fuse.js";
import { date } from "quasar";
import { validationMixin } from "vuelidate";
import { required, minLength } from "vuelidate/lib/validators";

/**
 * Parses airports into Quasar autocomplete format.
 */
const parseAirports = () => {
  return airports.map(country => ({
    city: country.city,
    label: `${country.city} (${country.code})`,
    sublabel: country.code // IATA code
  }));
};

/**
 * Checks if the selected airport is valid.
 */
const isAirport = (value, vm) => {
  return vm.suggestionList.some(airport => airport.sublabel === value);
};

export default {
  name: "Search",
  mixins: [validationMixin],
  validations: {
    departureCity: { required, minLength: minLength(3), isAirport },
    arrivalCity: { required, minLength: minLength(3), isAirport }
  },
  data() {
    return {
      departureCity: "",
      arrivalCity: "",
      departureDate: new Date(),
      suggestionList: parseAirports()
    };
  },
  methods: {
    /**
     * Pushes query parameters (with IATA codes) to the search results route.
     */
    search() {
      console.log("✈️ Searching flights:", this.departureCity, "→", this.arrivalCity);

      this.$router.push({
        name: "searchResults",
        query: {
          date: date.formatDate(this.departureDate, "YYYY-MM-DD"),
          departure: this.departureCity,
          arrival: this.arrivalCity
        }
      });
    },

    /**
     * Uses fuzzy search to match city names or codes.
     */
    fuzzySearchFilter(terms, { field, list }) {
      const token = terms.toLowerCase();
      const options = {
        shouldSort: true,
        threshold: 0.3,
        distance: 100,
        maxPatternLength: 10,
        minMatchCharLength: 3,
        keys: [field, "sublabel"]
      };
      const fuse = new Fuse(list, options);
      return fuse.search(token);
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables'

.search__options--input
  padding 0.3rem 1.5rem
  max-width 30rem
  margin auto

.wrapper
  display flex
  flex-direction column
  align-items center
  margin-top 1rem

.cta__button
  margin-top 2rem
  width 200px
</style>


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
import { priceFilter, scheduleFi


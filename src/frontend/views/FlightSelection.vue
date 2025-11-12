<!-- ONLY ONE FlightSelection.vue component -->
<template>
  <q-page>
    <flight-toolbar
      v-if="selectedFlight"
      :departure="getDepartureCode()"
      :arrival="getArrivalCode()"
    />
    
    <div class="flights">
      <div class="heading">
        <div class="q-headline text-primary text-center flight__headline">
          Review your selection
        </div>
        <flight-loader v-if="loading" />
      </div>
      
      <flight-card v-if="selectedFlight" :details="selectedFlight" />
      
      <div v-else-if="!loading" class="wrapper text-center q-mt-lg">
        <q-icon name="error" size="4rem" color="negative" />
        <div class="q-title q-mt-md text-negative">Flight not found</div>
        <q-btn 
          @click="$router.go(-1)" 
          color="primary" 
          label="Go Back" 
          class="q-mt-md"
        />
      </div>
    </div>

    <div class="form__payment" v-if="selectedFlight">
      <div class="text-center">
        <div class="form__header q-pt-md q-headline text-primary text-center">
          Payment details
        </div>
        
        <div class="form">
          <form @submit.prevent="payment">
            <div class="group">
              <label for="name">
                <span class="text-secondary">Name</span>
                <input
                  v-model="form.name"
                  id="name"
                  name="name"
                  placeholder="Name on card"
                  class="form__input field form__name"
                  required
                />
              </label>
              
              <label>
                <span class="text-secondary">Country</span>
                <q-select
                  v-model="form.country"
                  class="q-pt-sm form__select form__country"
                  filter
                  placeholder="Country"
                  :options="form.countryOptions"
                  hide-underline
                />
              </label>
              
              <label for="postcode">
                <span class="text-secondary">Postcode</span>
                <input
                  v-model="form.postcode"
                  id="postcode"
                  name="postcode"
                  placeholder="Postcode"
                  class="form__input field form__postcode"
                  required
                />
              </label>
              
              <label>
                <span class="text-secondary">Card number</span>
                <div id="card-number-element" class="form__stripe field form__card"></div>
              </label>
              
              <label>
                <span class="text-secondary">Expiry date</span>
                <div id="card-expiry-element" class="form__stripe field form__expiry"></div>
              </label>
              
              <label>
                <span class="text-secondary">CVC</span>
                <div id="card-cvc-element" class="form__stripe field form__cvc"></div>
              </label>
            </div>
            
            <div class="outcome">
              <div class="error text-bold text-secondary form__error" v-if="token.error">
                {{ token.error.message }}
              </div>
            </div>
          </form>
        </div>

        <q-btn
          @click="payment"
          class="cta__button text-weight-medium q-mt-md"
          color="secondary"
          label="Agree and pay now"
          :disable="form.isCardInvalid || processing"
          :loading="processing"
        >
          <q-icon class="cta__button--direction" name="keyboard_arrow_right" size="2.6rem" />
        </q-btn>
        
        <div class="q-mt-sm text-caption text-grey-6">
          Total: {{ selectedFlight.price ? `$${selectedFlight.price}` : 'Price not available' }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import FlightCard from "../components/FlightCard";
import FlightToolbar from "../components/FlightToolbar";
import FlightLoader from "../components/FlightLoader";
import { mapState, mapGetters } from "vuex";

let stripe, card;

export default {
  name: "FlightSelection",
  props: {
    flight: Object,
    flightId: { type: String, required: true }
  },
  components: {
    FlightCard,
    FlightToolbar,
    FlightLoader
  },
  computed: {
    ...mapGetters({
      firstName: "profile/firstName",
      customer: "profile/userAttributes",
      isAuthenticated: "profile/isAuthenticated"
    }),
    ...mapState({
      loading: state => state.catalog.loading,
      profile: state => state.profile
    })
  },
  async beforeMount() {
    try {
      if (this.isAuthenticated && !this.flight) {
        this.selectedFlight = await this.$store.dispatch("catalog/fetchByFlightId", {
          flightId: this.flightId
        });
      } else if (this.flight) {
        this.selectedFlight = this.flight;
      }
    } catch (error) {
      console.error('Error loading flight:', error);
      this.$q.notify({
        type: 'negative',
        message: 'Failed to load flight details',
        timeout: 3000
      });
    }
  },
  mounted() {
    this.loadStripeJS()
      .then(() => this.loadStripeElements())
      .catch(error => {
        console.error('Stripe loading error:', error);
        this.$q.notify({
          type: 'negative',
          message: 'Payment system initialization failed',
          timeout: 3000
        });
      });
  },
  data() {
    return {
      token: { details: null, error: null },
      stripeKey: process.env.VUE_APP_StripePublicKey || "pk_test_your_key",
      processing: false,
      form: {
        name: "",
        country: null,
        postcode: "",
        countryOptions: [
          { label: "Brazil", value: "BR" },
          { label: "United Kingdom", value: "UK" },
          { label: "United States", value: "US" }
        ],
        isCardInvalid: true
      },
      selectedFlight: this.flight
    };
  },
  methods: {
    getDepartureCode() {
      if (!this.selectedFlight) return '';
      return this.selectedFlight.departureAirport?.code || 
             this.selectedFlight.departureAirportCode || 
             'Unknown';
    },
    
    getArrivalCode() {
      if (!this.selectedFlight) return '';
      return this.selectedFlight.arrivalAirport?.code || 
             this.selectedFlight.arrivalAirportCode || 
             'Unknown';
    },

    async payment() {
      if (this.form.isCardInvalid) {
        this.$q.notify({
          type: 'negative',
          message: 'Please complete card details',
          timeout: 3000
        });
        return;
      }

      this.processing = true;
      this.$q.loading.show({ message: "Processing payment..." });

      const options = {
        name: this.form.name,
        address_zip: this.form.postcode,
        address_country: this.form.country?.value || this.form.country
      };

      try {
        const { token, error } = await stripe.createToken(card, options);
        this.token.details = token;
        this.token.error = error;

        if (error) {
          throw error;
        }

        const user = this.profile?.user;
        const userId = user?.id || user?.sub || user?.username;

        if (!userId) {
          throw new Error("Please log in to create a booking");
        }

        const passengers = [{
          name: this.form.name || this.firstName || "Passenger",
          email: user?.email || this.customer?.email || "user@example.com"
        }];

        const contactInfo = {
          email: user?.email || this.customer?.email || "user@example.com",
          phone: user?.phone_number || this.customer?.phone_number || "",
          name: this.form.name || this.firstName || "Passenger"
        };

        await this.$store.dispatch("bookings/createBooking", {
          paymentToken: this.token,
          outboundFlight: this.selectedFlight,
          userId: userId,
          passengers: passengers,
          contactInfo: contactInfo
        });

        this.$q.loading.show({
          message: "Booking confirmed! Redirecting..."
        });

        setTimeout(() => {
          this.$q.loading.hide();
          this.$router.push({ name: "bookings" });
        }, 2000);

      } catch (err) {
        console.error("Payment error:", err);
        this.$q.loading.hide();
        this.$q.notify({
          type: "negative",
          message: `Booking failed: ${err.message}`,
          timeout: 5000
        });
      } finally {
        this.processing = false;
      }
    },

    loadStripeJS() {
      return new Promise((resolve, reject) => {
        if (window.Stripe) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://js.stripe.com/v3/";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Failed to load Stripe"));
        document.head.appendChild(script);
      });
    },

    updateCardFeedback(event) {
      this.token.error = event.error;
      this.form.isCardInvalid = !event.complete;
    },

    loadStripeElements() {
      stripe = window.Stripe(this.stripeKey);
      const elements = stripe.elements();
      const style = {
        base: {
          color: "#31325F",
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: "antialiased",
          fontSize: "16px",
          "::placeholder": { color: "#CFD7E0" }
        }
      };

      card = elements.create("cardNumber", { style });
      const cardExpiry = elements.create("cardExpiry", { style });
      const cardCvc = elements.create("cardCvc", { style });

      card.mount("#card-number-element");
      cardExpiry.mount("#card-expiry-element");
      cardCvc.mount("#card-cvc-element");

      card.on("change", this.updateCardFeedback);
      cardExpiry.on("change", this.updateCardFeedback);
      cardCvc.on("change", this.updateCardFeedback);
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables'

.flights
  margin-top $content-toolbar-margin

.q-headline
  margin-top 2rem

.form__payment, .form__header
  background $grey-2

form
  width auto
  margin 20px

.group
  background white
  box-shadow 0 7px 14px 0 rgba(49, 49, 93, 0.1), 0 3px 6px 0 rgba(0, 0, 0, 0.08)
  border-radius 4px
  margin-bottom 20px

label
  position relative
  font-weight 300
  height 40px
  line-height 40px
  display flex

.group label:not(:last-child)
  border-bottom 1px solid #F0F5FA

label > span
  width 120px
  text-align right
  margin-right 0.4rem

.field
  background transparent
  font-weight 300
  border none
  color #31325F
  outline none
  flex 1
  padding-right 10px
  padding-left 10px
  cursor text

.field::-webkit-input-placeholder
  color #CFD7E0

.outcome
  float left
  width 100%
  padding-top 8px
  min-height 24px
  text-align center

.error
  font-size 20px
</style>

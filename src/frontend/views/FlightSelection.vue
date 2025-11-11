<template>
  <q-page>
    <flight-toolbar
      v-if="selectedFlight"
      :departure="selectedFlight.departureAirportCode"
      :arrival="selectedFlight.arrivalAirportCode"
    />
    
    <div class="flights">
      <div class="heading">
        <div class="q-headline text-primary text-center flight__headline">
          Review your selection
        </div>
        <flight-loader v-if="loading" />
      </div>
      <flight-card v-if="selectedFlight" :details="selectedFlight" />
    </div>

    <div class="form__payment">
      <div class="text-center">
        <div class="form__header q-pt-md q-headline text-primary text-center">
          Payment details
        </div>
        
        <div class="form">
          <form>
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

        <!-- Debug button -->
        <q-btn 
          @click="debugUser" 
          class="q-mt-md" 
          color="warning" 
          label="Debug User Info"
          size="sm"
        />

        <q-btn
          @click="payment"
          class="cta__button text-weight-medium q-mt-md"
          color="secondary"
          label="Agree and pay now"
          :disable="$v.form.$invalid || form.isCardInvalid"
        >
          <q-icon class="cta__button--direction" name="keyboard_arrow_right" size="2.6rem" />
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script>
import FlightCard from "../components/FlightCard";
import FlightToolbar from "../components/FlightToolbar";
import FlightLoader from "../components/FlightLoader";
import { validationMixin } from "vuelidate";
import { required, minLength } from "vuelidate/lib/validators";
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
  mixins: [validationMixin],
  validations: {
    form: {
      name: { required },
      country: { required },
      postcode: { required, minLength: minLength(3) }
    }
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
    if (this.isAuthenticated && !this.flight) {
      this.selectedFlight = await this.$store.dispatch("catalog/fetchByFlightId", {
        flightId: this.flightId
      });
    }
  },
  mounted() {
    this.loadStripeJS()
      .then(() => this.loadStripeElements())
      .catch(console.error);
  },
  data() {
    return {
      token: { details: "", error: "" },
      stripeKey: process.env.VUE_APP_StripePublicKey || "pk_test_your_key",
      form: {
        name: "",
        country: "",
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
    debugUser() {
      console.group("USER DEBUG INFO");
      console.log("Profile store:", this.profile);
      console.log("Profile user:", this.profile?.user);
      console.log("Customer getter:", this.customer);
      console.log("First name:", this.firstName);
      console.log("Is authenticated:", this.isAuthenticated);
      
      // Show available user IDs
      const user = this.profile?.user;
      console.log("Available user IDs:", {
        id: user?.id,
        sub: user?.sub,
        username: user?.username,
        email: user?.email
      });
      console.groupEnd();
    },

    async payment() {
      const options = {
        name: this.form.name,
        address_zip: this.form.postcode,
        address_country: this.form.country
      };

      try {
        // Create Stripe token
        const { token, error } = await stripe.createToken(card, options);
        this.token.details = token;
        this.token.error = error;

        if (error) throw error;

        // Get user data
        const user = this.profile?.user;
        const userId = user?.id || user?.sub || user?.username;

        if (!userId) {
          throw new Error("Please log in to create a booking");
        }

        console.log("Creating booking for user:", userId);

        // Prepare booking data
        const passengers = [{
          name: this.form.name || this.firstName || "Passenger",
          email: user?.email || this.customer?.email || "user@example.com"
        }];

        const contactInfo = {
          email: user?.email || this.customer?.email || "user@example.com",
          phone: user?.phone_number || this.customer?.phone_number || "",
          name: this.form.name || this.firstName || "Passenger"
        };

        // Create booking
        await this.$store.dispatch("bookings/createBooking", {
          paymentToken: this.token,
          outboundFlight: this.selectedFlight,
          userId: userId,
          passengers: passengers,
          contactInfo: contactInfo
        });

        // Success
        this.$q.loading.show({
          message: "Booking confirmed! Redirecting..."
        });

        setTimeout(() => {
          this.$q.loading.hide();
          this.$router.push({ name: "bookings" });
        }, 2000);

      } catch (err) {
        this.$q.loading.hide();
        console.error("Payment error:", err);
        this.$q.notify({
          type: "negative",
          message: `Booking failed: ${err.message}`,
          timeout: 5000
        });
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
        script.onerror = () => reject("Failed to load Stripe");
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


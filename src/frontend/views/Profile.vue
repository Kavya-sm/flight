<template>
  <div class="row">
    <div class="col-12 wrapper">
      <div class="heading">
        <div
          class="text-primary q-display-1 loyalty__heading--name"
          data-test="loyalty-name"
        >
          {{ fullName }}
        </div>
        <div class="loyalty__heading--tier">
          <div
            class="q-title loyalty__heading-tier-name"
            data-test="loyalty-level"
            :class="`text-${loyaltyColor}`"
          >
            {{ formattedLevel }}
          </div>
        </div>
      </div>
      
      <div class="wrapper">
        <div class="row loyalty__progress">
          <div class="col-7 loyalty__progress--points">
            <div class="q-display-1 loyalty__points" data-test="loyalty-points">
              {{ loyalty.points || 0 }}
            </div>
            <div class="q-title text-primary text-bold">Total Points</div>
          </div>
          <div class="col-5">
            <div
              class="q-display-1 loyalty__progress--next-tier"
              data-test="loyalty-next-tier"
            >
              {{ loyalty.percentage || 0 }}%
            </div>
            <div class="q-title text-primary text-bold">Next Tier Progress</div>
            <q-progress 
              :percentage="loyalty.percentage" 
              :color="loyaltyColor" 
              class="q-mt-sm"
            />
          </div>
        </div>
        
        <div class="row">
          <div class="profile__loyalty--heading col-12 text-left q-mt-lg">
            <q-toolbar color="grey-1 text-black">
              <q-toolbar-title class="text-bold">Loyalty Information</q-toolbar-title>
            </q-toolbar>
          </div>
          <div class="profile__loyalty-info col-12">
            <q-list highlight no-border class="q-pa-none q-ml-md">
              <q-item class="q-pa-none q-mt-md">
                <q-icon name="military_tech" size="2.6rem" :color="loyaltyColor" />
                <q-item-main
                  class="text-bold q-title q-ml-md"
                  label="Current Tier"
                  :sublabel="formattedLevel"
                />
              </q-item>
              <q-item class="q-pa-none q-mt-md">
                <q-icon name="card_giftcard" size="2.6rem" color="primary" />
                <q-item-main
                  class="text-bold q-title q-ml-md"
                  label="Points to Next Tier"
                  :sublabel="loyalty.remainingPoints || 0"
                />
              </q-item>
              <q-item class="q-pa-none q-mt-md">
                <q-icon name="trending_up" size="2.6rem" color="positive" />
                <q-item-main
                  class="text-bold q-title q-ml-md"
                  label="Progress Status"
                  :sublabel="progressText"
                />
              </q-item>
            </q-list>
          </div>
        </div>
        
        <!-- Test button to add points (remove in production) -->
        <div class="row q-mt-lg" v-if="isAuthenticated">
          <div class="col-12">
            <q-btn 
              color="primary" 
              label="Add 100 Points (Test)" 
              @click="addTestPoints"
              class="full-width"
            />
          </div>
        </div>
      </div>
      
      <amplify-sign-out class="Form--signout"></amplify-sign-out>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { AmplifyEventBus } from "aws-amplify-vue";

export default {
  name: "Profile",
  computed: {
    ...mapState({
      user: state => state.profile.user,
      loyalty: state => state.loyalty.loyalty
    }),
    ...mapGetters({
      isAuthenticated: "profile/isAuthenticated",
      firstName: "profile/firstName",
      lastName: "profile/lastName"
    }),
    fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
    formattedLevel() {
      if (!this.loyalty.level) return "Bronze";
      return this.loyalty.level.charAt(0).toUpperCase() + this.loyalty.level.slice(1);
    },
    loyaltyColor() {
      const colors = {
        bronze: 'brown',
        silver: 'grey-7',
        gold: 'amber',
        platinum: 'cyan'
      };
      return colors[this.loyalty.level] || 'primary';
    },
    progressText() {
      if (this.loyalty.level === 'platinum' && this.loyalty.remainingPoints === 0) {
        return 'Maximum tier reached!';
      }
      return `${this.loyalty.percentage}% to next tier`;
    }
  },
  methods: {
    async addTestPoints() {
      try {
        await this.$store.dispatch("loyalty/addLoyaltyPoints", 100);
        this.$q.notify({
          type: 'positive',
          message: '100 points added successfully!',
          timeout: 2000
        });
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to add points',
          timeout: 2000
        });
      }
    }
  },
  async mounted() {
    AmplifyEventBus.$on("authState", info => {
      if (info === "signedOut") {
        this.$store
          .dispatch("profile/getSession")
          .catch(
            this.$router.push({ name: "auth", query: { redirectTo: "home" } })
          );
      }
    });

    try {
      if (this.isAuthenticated) {
        await this.$store.dispatch("loyalty/fetchLoyalty");
      }
    } catch (error) {
      console.error(error);
      this.$q.notify(
        `Error while fetching Loyalty - Check browser console messages`
      );
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables'

a
  text-decoration none
  color black

.loyalty__heading
  &--tier
    margin $between-content-margin

.loyalty__progress
  &--points > *
    margin $between-content-margin

  &--next-tier > *
    margin $between-content-margin

:root
  --amazonOrange $secondary !important
  --color-primary $primary !important
</style>

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
            <div class="q-title text-primary text-bold">Points</div>
          </div>
          <div class="col-4">
            <div
              class="q-display-1 loyalty__progress--next-tier"
              data-test="loyalty-next-tier"
            >
              {{ loyalty.percentage || 0 }}%
            </div>
            <div class="q-title text-primary text-bold">Next Tier Progress</div>
            <q-progress :percentage="loyalty.percentage" color="secondary" />
          </div>
        </div>
        <div class="row">
          <div class="profile__preferences--heading col-12 text-left q-mt-lg">
            <q-toolbar color="grey-1 text-black">
              <q-toolbar-title class="text-bold">Loyalty Information</q-toolbar-title>
            </q-toolbar>
          </div>
          <div class="profile__preferences-options col-12">
            <q-list highlight no-border class="q-pa-none q-ml-md">
              <q-item class="q-pa-none q-mt-md">
                <q-icon name="star" size="2.6rem" color="secondary" />
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
                  label="Progress"
                  :sublabel="`${loyalty.percentage || 0}% to next tier`"
                />
              </q-item>
            </q-list>
          </div>
        </div>
      </div>
      <amplify-sign-out class="Form--signout"></amplify-sign-out>
    </div>
  </div>
</template>

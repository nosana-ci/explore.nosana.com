<template>
  <div>
    <div class="box has-background-white-ter">
      <Search />
    </div>
    <JobStats />
    <JobTimestamps />
    <div class="columns mt-4 is-multiline is-flex-direction-row" style="align-items: stretch;">
      <div class="column is-6 is-flex">
        <div class="box is-flex is-flex-direction-column" style="width: 100%;">
          <JobLatest />
        </div>
      </div>
      <div class="column is-6 is-flex">
        <div class="box is-flex is-flex-direction-column" style="width: 100%;">
          <h2 class="title is-5">Queued Jobs</h2>
          <MarketQueues></MarketQueues>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Search from "~/components/Search.vue";
import JobStats from "~/components/Job/Stats.vue";
import JobTimestamps from "~/components/Job/Timestamps.vue";
import JobLatest from "~/components/Job/Latest.vue";
import MarketQueues from "~/components/Market/Queues.vue";
</script>

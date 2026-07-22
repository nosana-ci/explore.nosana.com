<template>
  <div class="pt-3">
  <div class="box">
    <!-- Quick Details Compact Grid -->
    <div class="content mb-5">
      <div class="columns is-multiline is-variable is-0 no-padding is-justify-content-flex-start mb-0">
        <!-- General Account Info -->
        <GeneralInfo :address="address" />
      </div>
    </div>
  </div>

  <!-- Jobs posted by this deployer -->
  <DeploymentList
    :per-page="limit"
    :total-jobs="totalJobs"
    v-model:page="page"
    v-model:state="state"
    :loading-jobs="loadingJobs"
    title="Jobs Posted"
    :jobs="jobs?.jobs || []"
  />
  </div>
</template>

<script setup lang="ts">
import GeneralInfo from "~/components/Info/GeneralInfo.vue";
import DeploymentList from "~/components/List/DeploymentList.vue";
import { jobStateMapping } from "@nosana/sdk";
import { ref, computed } from 'vue';
import type { Ref, ComputedRef } from 'vue';

const { params } = useRoute();
const address: Ref<string> = ref(params.id as string);

// Job list data - jobs posted by this deployer
const page: Ref<number> = ref(1);
const state: Ref<number | null> = ref(null);
const limit: Ref<number> = ref(10);
const jobsUrl: ComputedRef<string> = computed(() => {
  return `/api/jobs?limit=${limit.value}&offset=${
    (page.value - 1) * limit.value
  }${state.value !== null ? `&state=${jobStateMapping[state.value]}` : ""}${
    "&poster=" + address.value
  }`;
});

interface JobsResponse {
  totalJobs: number;
  jobs: any[];
}

const { data: jobs, pending: loadingJobs } = useAPI(
  jobsUrl,
  { watch: [jobsUrl] }
);

const totalJobs = computed(() => {
  return jobs.value?.totalJobs ?? undefined;
});
</script>

<style lang="scss" scoped>
.no-padding {
  padding: 0 !important;
}
</style>

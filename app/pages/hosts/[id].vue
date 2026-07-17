<template>
  <div class="pt-3">
  <div class="box">
    <!-- Quick Details Compact Grid -->
    <div class="content mb-5">
      <div class="columns is-multiline is-variable is-0 no-padding is-justify-content-flex-start mb-0">
        <!-- General Account Info -->
        <GeneralInfo :address="address" />
        <!-- Host Info -->
        <HostInfo
          :address="address"
        />
      </div>
    </div>
  </div>
  
  <!-- Host Metrics Overview -->
  <div v-if="nodeSpecs && benchmarkMarketIdReady">
    <HostMetricsChart
      title="Host Metrics Overview"
      :node-id="address"
      :market-address="benchmarkMarketId"
      default-metric="tokensPerSecond"
    />
  </div>
  
  <!-- Jobs ran list moved from HostInfo to here -->
  <DeploymentList
    :per-page="limit"
    :total-jobs="totalJobs"
    v-model:page="page"
    v-model:state="state"
    :loading-jobs="loadingJobs"
      title="Jobs Ran"
    :jobs="jobs?.jobs || []"
    :states="[1, 2]"
  />
  </div>
</template>

<script setup lang="ts">
import GeneralInfo from "~/components/Info/GeneralInfo.vue";
import HostInfo from "~/components/Info/HostInfo.vue";
import DeploymentList from "~/components/List/DeploymentList.vue";
import HostMetricsChart from "~/components/HostMetricsChart.vue";
import { ref, computed } from 'vue';
import type { Ref, ComputedRef } from 'vue';

const { params } = useRoute();
const address: Ref<string> = ref(params.id as string);

// Node Specs & Benchmark Market ID
const { data: nodeSpecs, pending: loadingSpecs } = useAPI(
  `/api/nodes/${address.value}/metrics`,
  {
    // @ts-ignore
    // disableToastOnError: true, // This option is not standard, remove or use supported ones
  }
);

// Fetch Node Info (public node API)
const nodeInfoUrl = computed(() => {
  if (!address.value || !nodeSpecs.value) return ''; // Fetch only if we have address and potentially valid nodeSpecs
  return `https://${address.value}.${useRuntimeConfig().public.nodeDomain}/node/info`;
});
const { data: nodeInfo, pending: loadingNodeInfo } = useAPI(
  nodeInfoUrl,
  {
    immediate: false,
    onRequestError: () => ({ info: null }),
    onResponseError: () => ({ info: null }),
    default: () => null,
    watch: [nodeInfoUrl]
  }
);

// Compare the host against its own market. Rendering HostMetricsChart
// before nodeSpecs resolves would mount it with an undefined
// marketAddress, fetch, then immediately re-fetch once the real value
// resolves - flashing the chart and then hiding it during the second
// fetch's loading state.
const benchmarkMarketIdReady = computed(() => !!nodeSpecs.value);

const benchmarkMarketId = computed(() => {
  return nodeSpecs.value?.marketAddress || undefined;
});

// Job list data - moved from HostInfo
const page: Ref<number> = ref(1);
const state: Ref<number | null> = ref(null);
const jobStateMapping: Record<number, string> = {
  0: "QUEUED",
  1: "RUNNING",
  2: "COMPLETED",
  3: "STOPPED",
};
const limit: Ref<number> = ref(10);
const jobsUrl: ComputedRef<string> = computed(() => {
  return `/api/jobs?limit=${limit.value}&offset=${
    (page.value - 1) * limit.value
  }${state.value !== null ? `&state=${jobStateMapping[state.value]}` : ""}${
    "&node=" + address.value
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
// Quick Details specific styling
.quick-detail-item {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  height: 100%;

  .quick-detail-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #7a7a7a;
    text-transform: uppercase;
    margin-bottom: 0.1rem;
  }

  .quick-detail-value {
    font-size: 0.85rem;
    font-weight: 500;
    color: #363636;
    word-break: break-word;

    .icon-text {
      color: #363636;
    }
  }
}

.no-padding {
  padding: 0 !important;
}

html.dark-mode {
  .quick-detail-item {
    .quick-detail-label {
      color: #b0b0b0;
    }

    .quick-detail-value,
    .quick-detail-value .icon-text {
      color: #ffffff;
    }
  }
}
</style>


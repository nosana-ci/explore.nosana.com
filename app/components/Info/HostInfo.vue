<template>
  <!-- Status -->
  <div class="column is-one-fifth is-full-mobile no-padding" style="min-width: 220px; margin-bottom: 0.75rem;">
    <div class="quick-detail-item">
      <span class="quick-detail-label">Status</span>
      <span class="quick-detail-value">
        <div
          v-if="statusType === 'RUNNING'"
          data-tooltip="Host is running a deployment"
          style="width: fit-content"
          class="is-flex"
        >
          <JobStatus :status="'RUNNING'"></JobStatus>
        </div>
        <div
          v-else-if="statusType === 'QUEUED'"
          data-tooltip="Host is queued in market"
          style="width: fit-content"
          class="is-flex"
        >
          <JobStatus :status="'QUEUED'"></JobStatus>
        </div>
        <div v-else-if="statusType === 'OFFLINE'" style="width: fit-content" class="is-flex">
          <JobStatus :status="'OFFLINE'"></JobStatus>
        </div>
        <span v-else>{{ statusText }}</span>
      </span>
    </div>
  </div>

  <!-- Host API Status -->
  <div class="column is-one-fifth is-full-mobile no-padding" style="min-width: 220px; margin-bottom: 0.75rem;">
    <div class="quick-detail-item">
      <span class="quick-detail-label">Host API Status</span>
      <span class="quick-detail-value">
        <span v-if="nodeInfo">Online</span>
        <span v-else-if="loadingInfo">...</span>
        <span v-else>Offline</span>
      </span>
    </div>
  </div>

  <!-- Running job -->
  <div class="column is-one-fifth is-full-mobile no-padding" style="min-width: 220px; margin-bottom: 0.75rem;">
    <div class="quick-detail-item">
      <span class="quick-detail-label">Running job</span>
      <span class="quick-detail-value">
        <nuxt-link
          v-if="nodeRuns && nodeRuns.length > 0"
          :to="`/jobs/${nodeRuns[0].account.job}`"
          class="address is-family-monospace"
        >{{ nodeRuns[0].account.job }}</nuxt-link>
        <span v-else-if="loadingRuns">...</span>
        <span v-else>-</span>
      </span>
    </div>
  </div>

  <!-- Host market -->
  <div class="column is-one-fifth is-full-mobile no-padding" style="min-width: 220px; margin-bottom: 0.75rem;">
    <div class="quick-detail-item">
      <span class="quick-detail-label">Host market</span>
      <span class="quick-detail-value">
        <span v-if="queueInfo">
          <nuxt-link
            :to="`/markets/${queueInfo.market.address.toString()}`"
            class="address is-family-monospace"
          >
            <span
              v-if="
                testgridMarkets &&
                testgridMarkets.find(
                  (tgm: any) =>
                    tgm.address === queueInfo!.market.address.toString()
                )
              "
            >
              {{
                testgridMarkets.find(
                  (tgm: any) =>
                    tgm.address === queueInfo!.market.address.toString()
                ).name
              }}
            </span>
            <span v-else>{{ queueInfo.market.address.toString() }}</span>
          </nuxt-link>
        </span>
        <span v-else>
          <span v-if="nodeSpecs">
            <template v-if="nodeSpecs.marketAddress">
              <nuxt-link
                :to="`/markets/${nodeSpecs.marketAddress}`"
                class="address is-family-monospace"
              >
                <span
                  v-if="
                    testgridMarkets &&
                    testgridMarkets.find(
                      (tgm: any) => tgm.address === nodeSpecs.marketAddress
                    )
                  "
                >
                  {{
                    testgridMarkets.find(
                      (tgm: any) => tgm.address === nodeSpecs.marketAddress
                    ).name
                  }}
                </span>
                <span v-else>{{ nodeSpecs.marketAddress }}</span>
              </nuxt-link>
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </span>
          <span v-else-if="loadingMarkets || loadingSpecs">...</span>
          <span v-else>-</span>
        </span>
      </span>
    </div>
  </div>

  <!-- Total Jobs -->
  <div class="column is-one-fifth is-full-mobile no-padding" style="min-width: 220px; margin-bottom: 0.75rem;">
    <div class="quick-detail-item">
      <span class="quick-detail-label">Total Jobs</span>
      <span class="quick-detail-value">
        <span v-if="loadingJobs">...</span>
        <span v-else-if="jobs">{{ jobs.totalJobs }}</span>
        <span v-else>-</span>
      </span>
    </div>
  </div>

  <!-- CLI Version -->
  <div class="column is-one-fifth is-full-mobile no-padding" style="min-width: 220px; margin-bottom: 0.75rem;">
    <div class="quick-detail-item">
      <span class="quick-detail-label">CLI Version</span>
      <span class="quick-detail-value">
        <span v-if="cliVersion">
          v{{ cliVersion }}
        </span>
        <span v-else-if="loadingInfo || loadingSpecs">...</span>
        <span v-else>-</span>
      </span>
    </div>
  </div>

  <AdaptiveMetricsGrid
    v-if="hasMetricSources"
    :sources="metricSources"
    :fields="metricFields"
  />
</template>

<script lang="ts" setup>
import { type Market } from "@nosana/sdk";
import JobStatus from "~/components/Job/Status.vue";
import InfoIcon from '@/assets/img/icons/info.svg?component';
import AdaptiveMetricsGrid from "~/components/UI/AdaptiveMetricsGrid.vue";
import type { MetricField } from "~/components/UI/AdaptiveMetricsGrid.vue";
const { nosana } = useSDK();
const { data: testgridMarkets } =
  useAPI("/api/markets");

const props = defineProps<{
  address: string;
}>();

const { markets, getMarkets, loadingMarkets } = useMarkets();
if (!markets.value) {
  getMarkets();
}
const queueInfo: ComputedRef<{ market: Market; position: number } | undefined> = computed(() => {
  let position = -1;
  const market = markets.value?.find((m) => {
    position = m.queue.findIndex((a: any) => a.toString() === props.address);
    return position !== -1;
  });
  if (market) {
    return { market, position };
  }
  return undefined;
});

const { data: nodeRuns, pending: loadingRuns } = useMyAsyncData(
  "getNodeRuns",
  async () => {
    if (props.address) {
      try {
        return await nosana.value.jobs.getRuns([
          {
            memcmp: {
              offset: 40,
              bytes: props.address,
            },
          },
        ]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
);

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
  return `/api/jobs?limit=${limit.value}&offset=${(page.value - 1) * limit.value}${state.value !== null ? `&state=${jobStateMapping[state.value]}` : ""}${"&node=" + props.address}`;
});

const { data: jobs, pending: loadingJobs } = useAPI(jobsUrl, { watch: [jobsUrl] });

const hasRanJobs: ComputedRef<Boolean> = computed(() => {
  return Boolean(jobs?.value?.jobs?.length);
});

/**********************
 * Node Specification *
 **********************/
 const { data: nodeSpecs, pending: loadingSpecs } = useAPI(
  `/api/nodes/${props.address}/metrics`,
  {
    // @ts-ignore
    disableToastOnError: true,
  }
);


const isNode: ComputedRef<Boolean> = computed(() => {
  return (
    (nodeRuns.value && nodeRuns.value.length) ||
    hasRanJobs.value ||
    (nodeSpecs.value && nodeSpecs.value.marketAddress) ||
    queueInfo.value
  );
});

/*************
 * Node Info *
 *************/
 const {
  data: nodeInfo,
  pending: loadingInfo,
  execute: getNodeInfo,
} = useAPI(
  `https://${props.address}.${useRuntimeConfig().public.nodeDomain}/node/info`,
  {
    immediate: false,
    // @ts-ignore
    disableToastOnError: true,
    // Handle backend/fetch errors silently
    onRequestError: () => ({ info: null }),
    onResponseError: () => ({ info: null }),
    // @ts-ignore
    options: {
      retry: 0,
    },
  }
);

// Specs come from host-manager (nodeSpecs.metrics), not the deprecated node
// /node/info payload — that live source is flaky and caused the specs to flash
// fresh then revert to stale cached values. nodeInfo is used for status only.
const cliVersion = computed(() => {
  // host-manager stores the CLI version under `package_version`; fall back to
  // the node's own live `/node/info` version when host-manager doesn't have it.
  return (
    nodeSpecs.value?.metrics?.package_version ??
    nodeInfo.value?.info?.version ??
    null
  );
});

const systemEnvironment = computed(() => {
  const value = nodeSpecs.value?.metrics?.system_environment;
  if (!value) return null;

  return String(value).toLowerCase().includes("wsl") ? "WSL" : "Linux";
});

const hasMetricSources = computed(() => {
  return Boolean(nodeSpecs.value?.metrics);
});

const metricFields: MetricField[] = [
  {
    key: "gpu",
    label: "GPU",
    paths: ["metrics.gpu.devices.0.name"],
  },
  {
    key: "nvidiaDriver",
    label: "NVIDIA Driver",
    paths: ["metrics.gpu.nvml_driver_version", "metrics.nvml_version"],
  },
  {
    key: "cudaVersion",
    label: "CUDA Version",
    paths: ["metrics.gpu.runtime_version", "metrics.cuda_runtime_version"],
  },
  {
    key: "cpu",
    label: "CPU",
    paths: ["metrics.cpu.cpu_model", "metrics.cpu_model"],
  },
  {
    key: "ram",
    label: "RAM",
    paths: ["metrics.ram_gb", "metrics.ram_mb"],
    transformPaths: {
      "metrics.ram_gb": "gbToMb",
    },
    formatter: "mb",
  },
  {
    key: "diskSpace",
    label: "Disk Space",
    paths: ["metrics.disk_gb"],
    formatter: "gb",
  },
  {
    key: "country",
    label: "Country",
    paths: ["metrics.network.country", "metrics.country"],
    formatter: "country",
  },
  {
    key: "systemEnvironment",
    label: "System Environment",
    paths: ["derived.systemEnvironment"],
  },
  {
    key: "download",
    label: "Download Speed",
    paths: ["metrics.network.download_mbps", "metrics.download_mbps"],
    formatter: "mbps",
  },
  {
    key: "upload",
    label: "Upload Speed",
    paths: ["metrics.network.upload_mbps", "metrics.upload_mbps"],
    formatter: "mbps",
  },
];

const metricSources = computed(() => ({
  metrics: nodeSpecs.value?.metrics,
  derived: {
    systemEnvironment: systemEnvironment.value,
  },
}));

// --- Status derivation (identical to host-ui HostQuickDetails) ---

// Address of the running deployment, if any (on-chain runs for this node).
const runningJobAddress = computed<string | null>(() => {
  const list = nodeRuns.value || [];
  return list.length ? list[0].account.job : null;
});

// The node API returns a payload (state/info) only when reachable; on error the
// fetch resolves to null. Use that presence as the online/offline signal.
const nodeReachable = computed(() => !!(nodeInfo.value && (nodeInfo.value.state || nodeInfo.value.info)));

// Status: on-chain running/queued take precedence; otherwise the node API's
// reachability decides restarting (up) vs offline (down). A detected running
// job wins over stale queue membership.
const statusType = computed(() => {
  if (loadingInfo.value || loadingRuns.value) return null;
  if (!isNode.value) return null;
  if (runningJobAddress.value) return "RUNNING";
  if (queueInfo.value) return "QUEUED";
  if (!nodeReachable.value) return "OFFLINE";
  return null; // reachable but idle → "(Re)starting" via statusText
});

const statusText = computed(() => {
  if (loadingInfo.value || loadingRuns.value) return "...";
  if (!isNode.value) return "Not a host";
  if (runningJobAddress.value) return "Running";
  if (queueInfo.value) return "Queued";
  if (nodeReachable.value) return "(Re)starting";
  return "Offline";
});


/*********************
 * Node Benchmarking *
 *********************/

// Safely call node info + benchmark if it's actually (or likely) a node
function fetchAdditionalNodeData() {
  // Use try-catch for both API calls
  try {
    getNodeInfo();
  } catch (err) {
    // Silent error handling - expected for offline nodes
    console.log("Could not fetch node data. Possibly offline host.");
  }
}

// If isNode is truthy, try fetching everything
if (isNode.value) {
  fetchAdditionalNodeData();
}

// Also watch if it changes, e.g. after specs load
watch(isNode, (val) => {
  if (val) {
    fetchAdditionalNodeData();
  }
});

// Always attempt to fetch node ranking if we have an address
const rankingUrl = computed(() =>
  props.address
    ? `/api/nodes/heartbeats/uptime/${props.address}`
    : ''
);

const { data: rankingData, pending: loadingRanking } = useAPI(
  rankingUrl,
  {
    // @ts-ignore
    disableToastOnError: true,
  }
);

interface NodeRanking {
  participationRate?: number;
  uptimePercentage: number;
}

const nodeRanking: ComputedRef<NodeRanking | null> = computed(() => {
  const history = Array.isArray(rankingData?.value) ? rankingData.value : [];
  const latest = history[history.length - 1];

  if (latest && typeof latest.uptimePercentage === 'number') {
    return {
      uptimePercentage: latest.uptimePercentage,
    };
  }

  return null;
});

</script>

<style lang="scss" scoped>
.address {
  word-break: break-all;
  white-space: normal;
  display: inline-block;
  line-height: 1.3;
}

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
    display: inline-flex; 
    align-items: center;
  }

  .quick-detail-value {
    font-size: 0.85rem;
    font-weight: 500;
    color: #363636;
    word-break: break-word;

    .icon-text {
      color: #363636;
    }
    .address {
        font-size: 0.8rem; 
    }
    .tag {
        font-size: 0.75rem; 
        padding: 0.2em 0.5em;
        height: auto;
        line-height: 1.2;
        vertical-align: middle;
    }
  }
}

.no-padding {
  padding: 0 !important;
}

</style>

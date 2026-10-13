<template>
  <div class="box">
    <div v-if="loading && !market">Loading market..</div>
    <div v-else>
      <div v-if="market">
        <h3 class="title mt-3">
          {{
            testgridMarkets.find((m: any) => m.address === marketId)?.name
              || marketId
          }}
        </h3>

        <div class="columns is-multiline">
          <div class="column is-12">
            <div class="table-container">
              <table class="table is-fullwidth is-striped">
              <tbody>
                <tr>
                  <td>GPU size</td>
                  <td>{{ totalNodes }} hosts</td>
                </tr>
                <tr>
                  <td>GPU address</td>
                  <td>
                    <a target="_blank" class="address is-family-monospace"
                      :href="'https://explorer.solana.com/address/' + marketId">
                      {{ marketId }}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Authority</td>
                  <td>
                    <a target="_blank" class="address is-family-monospace"
                      :href="'https://explorer.solana.com/address/' + market.authority.toString()">
                      {{ market.authority.toString() }}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Price</td>
                  <td>
                    <CurrentMarketPrice 
                      :marketAddressOrData="market" 
                      :marketsData="testgridMarkets"
                      :decimalPlaces="3" />
                  </td>
                </tr>
                <!-- <tr>
                  <td>Host payment</td>
                  <td>
                    <span v-if="nosRatePerHour !== null">
                      {{ nosRatePerHour.toFixed(3) }} NOS/h
                      <span v-if="hostPaymentUsd">
                        (${{ hostPaymentUsd.toFixed(3) }}/h)
                      </span>
                    </span>
                    <span v-else-if="loading || loadingStats">...</span>
                    <span v-else>N/A</span>
                  </td>
                </tr> -->
                <tr>
                  <td>Access key</td>
                  <td>
                    <a target="_blank" class="address is-family-monospace"
                      :href="'https://explorer.solana.com/address/' + market.nodeAccessKey.toString()">
                      {{ market.nodeAccessKey.toString() }}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>

        <div class="py-5">
          <div class="level mb-4">
            <div class="level-left">
              <h2 class="title is-5 mb-0">Hosts Overview</h2>
            </div>
          </div>

          <div class="hosts-card">
            <div class="hosts-summary p-4">
              <!-- Running, queued and idle are disjoint, so together they fill the bar. -->
              <div class="hosts-bar mb-3">
                <span v-for="seg in hostSegments" v-show="seg.count" :key="seg.key" class="hosts-bar-seg"
                  :class="seg.tone" :style="{ flexGrow: seg.count }" :title="`${seg.label}: ${seg.count}`"></span>
              </div>

              <div class="seg-tabs">
                <button :class="{ 'is-active': hostFilter === 'all' }" @click="hostFilter = 'all'">
                  All <span class="has-text-grey ml-1">{{ totalNodes }}</span>
                </button>
                <button v-for="seg in hostSegments" :key="seg.key" class="is-inline-flex is-align-items-center"
                  :class="{ 'is-active': hostFilter === seg.key }" @click="hostFilter = seg.key">
                  <StatusMark :tone="seg.tone" :size="10" class="mr-2" />
                  {{ seg.label }} <span class="has-text-grey ml-1">{{ seg.count }}</span>
                </button>
              </div>
            </div>

            <div class="hosts-list">
              <nuxt-link v-for="host in filteredHosts" :key="host.address" :to="`/hosts/${host.address}`"
                class="hosts-row is-flex is-align-items-center px-4 py-2">
                <StatusMark :tone="host.tone" :size="10" :label="host.label" class="mr-3" />
                <span class="is-family-monospace address">{{ host.address }}</span>
              </nuxt-link>
              <div v-if="!filteredHosts.length" class="p-4 has-text-grey">
                {{ loadingRunningNodes || loadingNodesWithAccess ? 'Loading hosts...' : 'No hosts' }}
              </div>
            </div>
          </div>
        </div>

        <DeploymentList :per-page="limit" :total-jobs="jobs ? jobs.totalJobs : null" v-model:page="page"
          v-model:state="state" :loading-jobs="loadingJobs" title="All Jobs for this GPU"
          :jobs="jobs ? jobs.jobs : []">
        </DeploymentList>
      </div>
      <div v-else-if="loading">Loading market...</div>
      <div v-else>Market not found for {{ marketId }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Market } from '@nosana/sdk'
import DeploymentList from "~/components/List/DeploymentList.vue";
import CurrentMarketPrice from "~/components/Market/CurrentPrice.vue";
import StatusMark from "~/components/Common/StatusMark.vue";
import type { StatusTone } from "~/composables/useStatus";
import type { Ref } from 'vue';

// Define the interface for the market data
interface TestgridMarket {
  address: string;
  name: string;
}

// Use the specific interface for the API call
const { data: testgridMarkets } = useAPI('/api/markets', {
  default: () => [] as TestgridMarket[], 
})
const { params } = useRoute()
const { nosana } = useSDK()

const market = ref<Market | null>(null)
const marketId = ref<string>(String(params.id))
const loading = ref<boolean>(false)

const { data: stats, pending: loadingStats } = useAPI('/api/stats')

// Calculate host payment using centralized pricing system
const marketAddress = computed(() => market.value?.address.toString() || null);
const { usdPricePerHour } = useMarketUsdPrice(marketAddress, computed(() => testgridMarkets.value));
const { nosRatePerHour } = useHostNosRate(computed(() => market.value));

// Host payment in USD (base rate without network fee since this is what hosts receive)
const hostPaymentUsd = computed(() => {
  return usdPricePerHour.value ? usdPricePerHour.value / 1.1 : null;
});

const page = ref<number>(1)
const state = ref<number | null>(null)
const jobStateMapping: Record<number, string> = {
  0: 'QUEUED',
  1: 'RUNNING',
  2: 'COMPLETED',
  3: 'STOPPED',
}
const limit = ref<number>(10)

const jobsUrl = computed(() => {
  const stateStr = state.value !== null ? `&state=${jobStateMapping[state.value]}` : ''
  return `/api/jobs?limit=${limit.value}&offset=${(page.value - 1) * limit.value}${stateStr}&market=${marketId.value}`
})
interface JobInfo { address: string; usdRewardPerHour?: number | null; timeStart?: number; timeEnd?: number; timeout?: number; state?: number | string; node?: string; }
interface JobsApiResponse { jobs: JobInfo[]; totalJobs: number; }
const { data: jobs, pending: loadingJobs } = useAPI(jobsUrl, {
  watch: [jobsUrl],
  default: () => ({ jobs: [], totalJobs: 0 }) as JobsApiResponse
})

watch(jobsUrl, () => {
  // Resetting jobs data might be needed depending on UX requirements
  // jobs.value = null;
})

const getMarket = async () => {
  try {
    loading.value = true
    market.value = await nosana.value.jobs.getMarket(marketId.value)
  } catch (e) {
    console.error("Error fetching market from SDK:", e)
    market.value = null
  }
  loading.value = false
}

getMarket()

interface NodeLike {
  toString(): string;
}

interface Job {
  totalJobs: number | null;
  jobs: any[];
}

interface Node {
  toString(): string;
}

const queuedNodes = computed(() => {
  // If it's not a node queue market, return empty array
  if (market.value?.queueType !== 1) {
    return []
  }

  const runningNodeSet = new Set(runningNodes.value)
  // Filter out nodes that are already running from the queue and ensure string type
  const filteredQueue = (market.value?.queue || []).filter((node: any) => {
    const nodeStr = typeof node === 'string' ? node : node.toString()
    return !runningNodeSet.has(nodeStr)
  })

  return filteredQueue.map((node: any) => 
    typeof node === 'string' ? node : node.toString()
  )
})

const totalNodes = computed(() => {
  const runningSet = new Set(runningNodes.value)
  const queuedSet = new Set(queuedNodes.value.map((node: NodeLike | string) =>
    typeof node === 'string' ? node : node.toString()
  ))
  const accessSet = new Set(nodesWithAccess.value.map((node: NodeLike | string) =>
    typeof node === 'string' ? node : node.toString()
  ))

  // Combine all sets
  const allNodesSet = new Set([
    ...runningSet,
    ...queuedSet,
    ...accessSet
  ])

  return allNodesSet.size
})

const availableNodesWithAccess = computed(() => {
  const runningNodeSet = new Set(runningNodes.value)
  const queuedNodeSet = new Set(queuedNodes.value.map((node: NodeLike | string) =>
    typeof node === 'string' ? node : node.toString()
  ))

  return nodesWithAccess.value.filter((node: NodeLike | string) => {
    const nodeStr = typeof node === 'string' ? node : node.toString()
    return !runningNodeSet.has(nodeStr) && !queuedNodeSet.has(nodeStr)
  })
})

type HostFilter = 'all' | 'running' | 'queued' | 'idle'
const hostFilter = ref<HostFilter>('all')

// Disjoint host groups; queued only exists on markets that queue nodes.
const hostSegments = computed(() => [
  { key: 'running' as const, label: 'Running', tone: 'live' as StatusTone, hosts: runningNodes.value },
  ...(market.value?.queueType === 1
    ? [{ key: 'queued' as const, label: 'Queued', tone: 'warn' as StatusTone, hosts: queuedNodes.value }]
    : []),
  { key: 'idle' as const, label: 'Idle', tone: 'neutral' as StatusTone, hosts: availableNodesWithAccess.value.map(String) },
].map(seg => ({ ...seg, count: seg.hosts.length })))

const filteredHosts = computed(() =>
  hostSegments.value
    .filter(seg => hostFilter.value === 'all' || seg.key === hostFilter.value)
    .flatMap(seg => seg.hosts.map((address: string) => ({ address, tone: seg.tone, label: seg.label })))
)

const runningNodesUrl = computed(() => `/api/jobs/running-nodes?market=${marketId.value}`)
const {
  data: runningNodesData,
  pending: loadingRunningNodes
} = useAPI(runningNodesUrl, {
  watch: [runningNodesUrl],
  default: () => [] as string[],
  immediate: true,
  lazy: true
})

const nodesWithAccessUrl = computed(() => `/api/nodes/with-access?marketAddress=${marketId.value}`)
const {
  data: nodesWithAccessData,
  pending: loadingNodesWithAccess
} = useAPI(nodesWithAccessUrl, {
  watch: [nodesWithAccessUrl],
  default: () => [] as string[],
  immediate: true,
  lazy: true
})

const nodesWithAccess = computed(() => nodesWithAccessData.value || [])
const runningNodes = computed(() => {
  // Ensure map callback has type
  return [...new Set(runningNodesData.value?.map((node: string) => String(node)) || [])]
})

onMounted(() => {
  getMarket(); // Fetch market data via SDK on mount
})
</script>

<style lang="scss" scoped>
.address {
  word-break: break-all;
}

/* Hairline container for the table inside the page's panel. */
.hosts-card {
  border: 1px solid $border-soft;
  border-radius: 14px;
  overflow: hidden;
}

html.dark-mode .hosts-card {
  border-color: rgba($white, 0.1);
}

.hosts-summary {
  border-bottom: 1px solid $border-soft;
}

/* Multi-segment bar; Bulma's progress only draws a single value. */
.hosts-bar {
  display: flex;
  gap: 0.2rem;
  height: $size-7;
  border-radius: $radius-rounded;
  overflow: hidden;
  background: $surface-track;
}

.hosts-bar-seg {
  flex-basis: 0;
  min-width: 0.4rem;

  &.live { background: $success; }
  &.warn { background: $warning; }
  &.neutral { background: $status-neutral; }
}

.hosts-list {
  max-height: 22.5rem;
  overflow-y: auto;
}

.hosts-row {
  color: inherit;
  border-bottom: 1px solid $border-soft;

  &:last-child { border-bottom: 0; }
  &:hover { background: $surface-hover; }
}

html.dark-mode {
  .hosts-summary,
  .hosts-row {
    border-color: rgba($white, 0.1);
  }

  .hosts-bar { background: rgba($white, 0.08); }
  .hosts-row:hover { background: rgba($white, 0.04); }
}
</style>

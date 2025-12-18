<template>
  <div>
    <!-- Search Box -->
    <div class="box has-background-white-ter">
      <Search />
    </div>

    <!-- World Map with Stats Overlay -->
    <div class="box p-0 world-map-box">
      <div class="map-container">
        <WorldMap />
        
        <!-- Stats Overlay - Bottom Left -->
        <div class="stats-overlay">
          <div class="stats-box">
            <span class="icon mr-3">
              <RocketIcon class="rocket-icon" />
            </span>
            <div class="stats-text">
              <div class="has-text-grey is-size-6">GPUs Available</div>
              <div class="has-text-weight-bold is-size-4">
                {{ queuedHosts }}/{{ activeHosts }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Loader v-if="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAPI } from "~/composables/useAPI";
import WorldMap from "~/components/WorldMap.vue";
import RocketIcon from "~/assets/img/icons/rocket.svg?component";
import Loader from "~/components/Loader.vue";
import Search from "~/components/Search.vue";

const { data: nodeStatsResponse } = await useAPI("/api/stats/nodes-country");
const loading = ref(false);

// Get running nodes from jobs API
const { data: runningNodesData } = useAPI("/api/jobs/running", {
  transform: (data: any) => {
    if (!data) return { total: 0 };
    return {
      total: Object.values(data).reduce(
        (sum: number, market: any) => sum + (market.running || 0),
        0
      ),
    };
  },
  default: () => ({ total: 0 }),
});

// Define interface for node stats item
interface NodeStatsItem {
  country: string;
  running: number;
  queue: number;
  offline: number;
  total: number;
}

// Calculate queued hosts
const queuedHosts = computed(() => {
  if (
    !nodeStatsResponse.value?.data ||
    !Array.isArray(nodeStatsResponse.value.data)
  )
    return 0;

  let total = 0;
  // Group by country and sum up queues
  nodeStatsResponse.value.data.forEach((item: NodeStatsItem) => {
    if (item.queue > 0) {
      total += item.queue;
    }
  });

  // Use API's total if available, otherwise use our calculation
  return nodeStatsResponse.value.totals?.totalQueued ?? total;
});

// Calculate active hosts using running nodes from jobs API
const activeHosts = computed(() => {
  const runningCount = runningNodesData.value?.total || 0;
  const queuedCount = queuedHosts.value;
  return runningCount + queuedCount;
});
</script>

<style lang="scss" scoped>
@use "sass:color";

.world-map-box {
  height: calc(100vh - 200px);
  min-height: 500px;
  margin-bottom: 0;
  overflow: visible;
  border-radius: 8px;
  position: relative;

  @media screen and (max-width: 1024px) {
    height: calc(100vh - 180px);
    min-height: 400px;
  }

  @media screen and (max-width: 768px) {
    height: calc(100vh - 160px);
    min-height: 350px;
    margin-bottom: 0;
  }
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.stats-overlay {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  z-index: 10;
  pointer-events: auto;

  @media screen and (max-width: 768px) {
    bottom: 1rem;
    left: 1rem;
  }
}

.stats-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);

  @media screen and (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
}

.stats-text {
  display: flex;
  flex-direction: column;
}

.rocket-icon {
  width: 28px;
  height: 28px;
  fill: #10e80c;

  @media screen and (max-width: 768px) {
    width: 24px;
    height: 24px;
  }
}

// Dark mode styles
html.dark-mode {
  .stats-box {
    background: rgba(26, 26, 26, 0.95);
    
    .has-text-grey {
      color: #b0b0b0 !important;
    }
    
    .has-text-weight-bold {
      color: #ffffff !important;
    }
  }
}
</style>

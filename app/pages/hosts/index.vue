<template>
  <div>
    <!-- Search Box -->
    <div class="box">
      <Search />
    </div>

    <!-- World Map with Stats Overlay -->
    <div class="box p-0 world-map-box">
      <div class="map-container">
        <WorldMap />
      </div>

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

const loading = ref(false);

// Same data source/formula as the markets page
const { markets, getMarkets, loadingMarkets } = useMarkets();
const { data: runningJobs } = await useAPI("/api/jobs/running");

if (!markets.value && !loadingMarkets.value) {
  getMarkets();
}

// Hosts currently idle/queued
const queuedHosts = computed(() => {
  if (!markets.value) return 0;
  return markets.value.reduce((a, b) => {
    return a + (b.queueType === 1 && b.queue ? b.queue.length : 0);
  }, 0);
});

const activeHosts = computed(() => {
  const running: number = runningJobs.value
    ? (Object.values(runningJobs.value) as any[]).reduce(
        (a: number, b: any) => a + (b.running || 0),
        0
      )
    : 0;
  return queuedHosts.value + running;
});
</script>

<style lang="scss" scoped>
@use "sass:color";

.world-map-box {
  // Match the map's shape, but never taller than the viewport
  aspect-ratio: 360 / 145;
  max-height: calc(100vh - 200px);
  margin-bottom: 0;
  overflow: visible;
  border-radius: 14px;
  position: relative;

  @media screen and (max-width: 1024px) {
    max-height: calc(100vh - 180px);
  }

  // Size to the map on mobile instead of the viewport
  @media screen and (max-width: 768px) {
    aspect-ratio: auto;
    max-height: none;
    margin-bottom: 0;
  }
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;

  @media screen and (max-width: 768px) {
    height: 400px;
  }
}

.stats-overlay {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  z-index: 10;
  pointer-events: auto;

  // Below the map on mobile so it doesn't cover it
  @media screen and (max-width: 768px) {
    position: static;
    margin-top: 1rem;
  }
}

.stats-box {
  background: rgba($white, 0.95);
  border: 1px solid $border-soft;
  border-radius: 14px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: $panel-shadow;
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
  fill: $secondary;

  @media screen and (max-width: 768px) {
    width: 24px;
    height: 24px;
  }
}

// Dark mode styles
html.dark-mode {
  .stats-box {
    background: rgba($black-ter, 0.95);
    border-color: rgba($white, 0.1);
    box-shadow: $panel-shadow-dark;
    
    .has-text-grey {
      color: $grey-light !important;
    }
    
    .has-text-weight-bold {
      color: $white !important;
    }
  }
}
</style>

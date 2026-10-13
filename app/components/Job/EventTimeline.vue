<template>
  <div>
    <h2 class="title is-5 mb-3">Activity</h2>

    <div class="lc-card">
      <p v-if="!items.length" class="lc-empty">
        No on-chain events recorded for this job yet.
      </p>

      <ol v-else class="lifecycle">
        <li v-for="item in items" :key="item.key" class="lc-stage">
          <!-- Marker + connecting rail -->
          <div class="lc-rail">
            <StatusMark :tone="item.tone" :label="item.title" />
          </div>

          <!-- Stage content -->
          <div class="lc-content">
            <div class="lc-top">
              <span class="lc-title">{{ item.title }}</span>
              <span
                class="lc-time"
                :title="
                  item.event.blockTime
                    ? formatEventTimestamp(item.event.blockTime)
                    : ''
                "
              >
                <template v-if="item.event.blockTime">{{
                  formatEventTimeAgo(item.event.blockTime)
                }}</template>
                <template v-else>Slot {{ item.event.slot ?? "—" }}</template>
              </span>
            </div>

            <p v-if="item.detail" class="lc-detail">
              <span class="lc-detail-label">{{ item.detail.label }}</span>
              <nuxt-link
                v-if="item.detail.to"
                :to="item.detail.to"
                class="lc-detail-link"
                :title="item.detail.value"
              >
                {{ item.detail.text }}
              </nuxt-link>
              <span v-else class="lc-detail-val">{{ item.detail.text }}</span>
            </p>

            <a
              :href="solscanTxUrl(item.event.signature, isDevnet)"
              target="_blank"
              rel="noopener"
              class="lc-tx"
              :title="item.event.signature"
            >
              <ArrowSquareUpRightIcon />
              View on Solscan
            </a>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  buildJobTimeline,
  formatEventTimeAgo,
  formatEventTimestamp,
  solscanTxUrl,
  type JobEvent,
  type MarketRef,
} from "~/utils/jobEvents";
import StatusMark from "~/components/Common/StatusMark.vue";
import ArrowSquareUpRightIcon from "@/assets/img/icons/arrow-square-up-right.svg?component";

const props = defineProps<{
  events: JobEvent[];
  // Used to name the market a job was posted to instead of only showing its
  // address; addresses are shown as-is when it isn't provided.
  markets?: MarketRef[] | null;
}>();

const config = useRuntimeConfig();
const isDevnet = config.public.network === "devnet";

// Newest first, matching the Deploy UI. The builder keeps the indexer's
// chronological order; reading direction is this component's decision.
const items = computed(() =>
  buildJobTimeline(props.events, props.markets).reverse(),
);
</script>

<style lang="scss" scoped>
@use "@/assets/styles/mixins.scss" as *;

/* A narrow timeline reads far better capped than stretched across the page. */
.lc-card {
  @include soft-panel;
  max-width: 620px;
  padding: 20px 22px;
}

.lc-empty {
  text-align: center;
  color: $text-muted;
  padding: 1.75rem 1rem;
  margin: 0;
  font-size: 0.85rem;
}

/* ---- Lifecycle timeline ---- */
.lifecycle {
  list-style: none;
  margin: 0;
  padding: 0;
}

.lc-stage {
  display: grid;
  grid-template-columns: 14px 1fr;
  gap: 12px;
  position: relative;
  padding-bottom: 22px;
  align-items: start;
}

.lc-stage:last-child {
  padding-bottom: 0;
}

/* The rail joins one stage's mark to the next. */
.lc-stage:not(:last-child)::before {
  content: "";
  position: absolute;
  left: 7px;
  transform: translateX(-50%);
  top: 24px;
  bottom: -3px;
  width: 2px;
  background: $grey-lighter;
}

html.dark-mode .lc-stage:not(:last-child)::before {
  background: rgba($white, 0.12);
}

.lc-rail {
  display: flex;
  justify-content: center;
  /* Sits the mark on the title's optical centre. */
  padding-top: 7px;
}

/* ---- Content ---- */
.lc-content {
  min-width: 0;
  padding-top: 3px;
}

.lc-top {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.lc-title {
  font-family: $title-family;
  font-weight: 600;
  font-size: 0.92rem;
  line-height: 1.5;
  color: $text;
}

.lc-time {
  margin-left: auto;
  flex: none;
  font-size: 0.72rem;
  color: $text-muted;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.lc-detail {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: $grey-dark;
}

.lc-detail-label {
  color: $text-muted;
  margin-right: 6px;
}

.lc-detail-link {
  font-family: $family-monospace;
  color: $link;

  &:hover {
    text-decoration: underline;
  }
}

.lc-tx {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: $text-muted;
  margin-top: 7px;
  text-decoration: none;
  transition: color 0.15s ease;

  svg {
    width: 12px;
    height: 12px;
  }

  &:hover {
    color: $secondary;
  }
}

html.dark-mode {
  .lc-title {
    color: $white;
  }

  .lc-detail {
    color: $grey-light;
  }
}
</style>

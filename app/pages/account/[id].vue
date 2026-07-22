<template>
  <div class="account-container">
    <h1 class="account-title">No Nosana activity found</h1>
    <p class="account-message">
      We couldn't find any jobs, hosts, markets or deployments linked to this account.
    </p>
    <p class="account-address is-family-monospace">
      <a :href="`https://solscan.io/account/${address}`" target="_blank" rel="noopener">
        {{ address }}
      </a>
    </p>
    <button class="button is-primary" @click="navigateTo('/')">
      Go Back Home
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';

const { params } = useRoute();
const address: Ref<string> = ref(params.id as string);
</script>

<style lang="scss" scoped>
.account-container {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.account-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  font-family: 'Space Grotesk', sans-serif;
}

.account-message {
  font-size: 1.1rem;
  max-width: 520px;
  margin-bottom: 1rem;
  color: var(--color-text-light);
}

.account-address {
  word-break: break-all;
  margin-bottom: 2rem;
}
</style>

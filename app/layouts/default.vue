<template>
  <div id="app">
    <top-bar />
    <div id="content" class="is-flex is-flex-direction-column">
      <div class="section">
        <div class="container is-fluid">
          <slot />
        </div>
      </div>
      <site-footer class="mt-auto" />
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#content {
  flex: 1;
  min-height: calc(100vh - 64px);
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
}
</style>

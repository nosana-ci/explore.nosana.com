<template>
  <div>
    <NuxtLayout>
      <NuxtPwaManifest />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Nosana Explore',
  ogTitle: 'Nosana Explore',
  twitterTitle: 'Nosana Explore',
  description: 'Explore the Nosana network',
  ogDescription: 'Explore the Nosana network',
  twitterDescription: 'Explore the Nosana network',
  ogImage: 'https://explore.nosana.com/img/screenshot.png',
  twitterImage: 'https://explore.nosana.com/img/screenshot.png',
  twitterCard: 'summary_large_image'
})

useHead({
  htmlAttrs: {
    lang: 'en'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/ico',
      href: '/favicon.ico',
      sizes: 'any'
    }
  ]
})

</script>
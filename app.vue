<script setup>
useHead({
  title: "Nuxt Leaflet",
  description: "Home page",
  htmlAttrs: {
    "data-theme": "light",
  },
  meta: {
    name: "viewport",
    content: "width=device-width, initial-scale=1, maximum-scale=1",
  },
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
body {
  margin: 0;
}
</style>

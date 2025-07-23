<script setup>
import Navigation from './components/Navigation.vue'
</script>

<template>
  <div class="app">
    <Navigation />
    <router-view />
  </div>
</template>

<style>
.app {
  font-family: 'Microsoft JhengHei', sans-serif;
}
</style>

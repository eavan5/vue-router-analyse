<!-- <script >
export default {
  name: 'App',
  mounted () {
    console.log(this.$route);
    console.log(this.$router);
  }
}
</script> -->
<script setup>
import { inject } from 'vue';

const route = inject('route')
const router = inject('router')
console.log(route, router);

</script>

<template>
  <router-link to="/">Home</router-link> |
  <router-link to="/about">About</router-link>
  <router-view>
  </router-view>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

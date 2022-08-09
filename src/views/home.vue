<template>
  <div>home</div>
  <router-link to="/a">A页面</router-link>
  <router-link to="/b">B页面</router-link>
  <router-view></router-view>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
</script>

<template>
  <div>home</div>
  <router-link to="/a">A页面</router-link>
  <router-link to="/b">B页面</router-link>
  <router-view></router-view>
</template>

<script>
export default {
  beforeRouteEnter () {
    console.log('beforeRouteEnter进入前');
  },
  beforeRouteUpdate () {
    console.log('beforeRouteUpdate更新前');
  },
  beforeRouteLeave () {
    console.log('beforeRouteLeave离开前');
  }
}
</script>

<script lang="ts" setup>
const data = ref([] as any[])

async function openSidePanel() {
  browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    if (tab?.id) {
      browser.sidePanel.open({ tabId: tab.id })
    }
  })
}
</script>

<template>
  <div>
    <a href="https://wxt.dev" target="_blank">
      <img src="/wxt.svg" class="logo" alt="WXT logo">
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="@/assets/vue.svg" class="logo vue" alt="Vue logo">
    </a>
  </div>
  <div class="d-btn d-btn-primary" @click="browser.runtime.openOptionsPage()">
    Options
  </div>
  <div class="d-btn d-btn-primary" @click="openSidePanel()">
    SidePanel
  </div>
  <div>
    {{ data.join(', ') }}
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #54bc4ae0);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

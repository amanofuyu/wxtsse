<script setup lang="ts">
import { md } from './utils'

const props = defineProps<{ content: string }>()

const html = computed(() => {
  return md.render(props.content)
})
</script>

<template>
  <div class="prose prose-invert" v-html="html" />
</template>

<style scoped></style>

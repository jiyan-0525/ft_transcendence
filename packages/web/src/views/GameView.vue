<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useGameStore } from '../stores/game'

const props = defineProps<{ roomId: string }>()
const store = useGameStore()

const status = computed(() => store.gameState?.status ?? 'WAITING')
const scores = computed(() => store.gameState?.scores ?? {})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowUp') store.sendInput(-1)
  else if (e.key === 'ArrowDown') store.sendInput(1)
}

onMounted(() => {
  store.connect()
  store.joinRoom(props.roomId)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  store.disconnect()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-4">
    <h2 class="text-2xl font-bold">Room: {{ roomId }}</h2>
    <p class="text-lg">Status: {{ status }}</p>
    <div class="flex gap-16 text-3xl font-mono">
      <span v-for="(score, player) in scores" :key="player">
        {{ player }}: {{ score }}
      </span>
    </div>
    <p class="text-sm text-gray-400">Use ArrowUp / ArrowDown to move</p>
    <p v-if="store.errorMessage" class="text-red-400">{{ store.errorMessage }}</p>
  </div>
</template>

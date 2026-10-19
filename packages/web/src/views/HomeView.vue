<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'

const router = useRouter()
const store = useGameStore()
const joinId = ref('')

function createRoom() {
  store.connect()
  store.createRoom()
  const unwatch = store.$subscribe(() => {
    if (store.roomId) {
      unwatch()
      router.push(`/game/${store.roomId}`)
    }
  })
}

function joinRoom() {
  if (!joinId.value) return
  store.connect()
  store.joinRoom(joinId.value)
  const unwatch = store.$subscribe(() => {
    if (store.roomId) {
      unwatch()
      router.push(`/game/${store.roomId}`)
    }
  })
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-8">
    <h1 class="text-4xl font-bold">Pong Arena</h1>
    <div class="flex gap-4">
      <button @click="createRoom" class="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700">
        Create Room
      </button>
      <div class="flex gap-2">
        <input v-model="joinId" placeholder="Room ID" class="px-3 py-2 text-black rounded" />
        <button @click="joinRoom" class="px-6 py-3 bg-green-600 rounded hover:bg-green-700">
          Join
        </button>
      </div>
    </div>
    <p v-if="store.errorMessage" class="text-red-400">{{ store.errorMessage }}</p>
  </div>
</template>

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ServerMessage, GameStateSnapshot } from '../types/protocol'

export const useGameStore = defineStore('game', () => {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)
  const roomId = ref('')
  const playerId = ref('')
  const gameState = ref<GameStateSnapshot | null>(null)
  const errorMessage = ref('')
  const inputSeq = ref(0)

  function connect() {
    if (ws.value?.readyState === WebSocket.OPEN) return
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    ws.value = new WebSocket(`${proto}://${location.host}/ws/game`)

    ws.value.onopen = () => { connected.value = true }
    ws.value.onclose = () => { connected.value = false }
    ws.value.onerror = () => { errorMessage.value = 'WebSocket error' }
    ws.value.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as ServerMessage
        handleMessage(msg)
      } catch {
        errorMessage.value = 'Invalid message'
      }
    }
  }

  function handleMessage(msg: ServerMessage) {
    switch (msg.type) {
      case 'game:created':
        roomId.value = msg.payload.roomId
        playerId.value = msg.payload.playerId
        break
      case 'game:joined':
        roomId.value = msg.payload.roomId
        playerId.value = msg.payload.playerId
        break
      case 'game:state':
        gameState.value = msg.payload
        break
      case 'game:error':
        errorMessage.value = msg.payload.message
        break
    }
  }

  function send(msg: { type: string; payload: unknown }) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(msg))
    }
  }

  function createRoom() { send({ type: 'game:create', payload: {} }) }
  function joinRoom(id: string) { send({ type: 'game:join', payload: { roomId: id } }) }
  function sendInput(dir: -1 | 0 | 1) {
    send({ type: 'game:input', payload: { seq: inputSeq.value++, dir } })
  }

  function disconnect() { ws.value?.close() }

  return { ws, connected, roomId, playerId, gameState, errorMessage, connect, createRoom, joinRoom, sendInput, disconnect }
})

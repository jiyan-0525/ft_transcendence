export type ClientMessage =
  | { type: 'game:create'; payload: Record<string, never> }
  | { type: 'game:join'; payload: { roomId: string } }
  | { type: 'game:input'; payload: { seq: number; dir: -1 | 0 | 1 } }

export type ServerMessage =
  | { type: 'game:created'; payload: { roomId: string; playerId: string } }
  | { type: 'game:joined'; payload: { roomId: string; playerId: string } }
  | { type: 'game:state'; payload: GameStateSnapshot }
  | { type: 'game:player_left'; payload: { roomId: string; playerId: string } }
  | { type: 'game:error'; payload: { code: string; message: string } }

export interface GameStateSnapshot {
  roomId: string
  tick: number
  status: 'WAITING' | 'PLAYING' | 'PAUSED' | 'FINISHED'
  ball: { x: number; y: number }
  paddles: Record<string, { y: number }>
  scores: Record<string, number>
}

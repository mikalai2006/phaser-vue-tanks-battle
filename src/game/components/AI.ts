import { defineComponent, Types } from 'bitecs'

export const AI = defineComponent({
  timeBetweenActions: Types.ui32,
  accumulatedTime: Types.ui32,
  accumulatedPathTime: Types.ui32,
  status: Types.ui8
})

export enum StatusAI {
  Idle = 0,
  MoveRandom = 1,
  MoveTo = 2
}

export default AI

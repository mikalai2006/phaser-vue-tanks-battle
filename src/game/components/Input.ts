import { defineComponent, Types } from 'bitecs'

export const Input = defineComponent({
  up: Types.ui8,
  down: Types.ui8,
  left: Types.ui8,
  right: Types.ui8,
  direction: Types.ui8,
  fire: Types.ui8,
  obstacle: Types.ui8,
  countRandom: Types.ui8
  // speed: Types.ui8
})

export enum Direction {
  None,
  Left,
  Right,
  Up,
  Down
}

export default Input

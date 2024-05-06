import { defineComponent, Types } from 'bitecs'

export const RotationTower = defineComponent({
  angle: Types.f32,
  // velocity: Types.f32,
  force: Types.f32,
  angleMuzzle: Types.f32
})

export default RotationTower

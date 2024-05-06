import { Types, defineComponent } from 'bitecs'

export const Bonus = defineComponent({
  // gridX: Types.i16,
  // gridY: Types.i16,
  type: Types.f32,
  value: Types.f32,
  duration: Types.f32,
  entityId: Types.i32
})

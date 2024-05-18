import { Types, defineComponent } from 'bitecs'

export const Weapon = defineComponent({
  type: Types.ui32,
  entityId: Types.i32,
  count: Types.i32,
  isRefresh: Types.i32
})

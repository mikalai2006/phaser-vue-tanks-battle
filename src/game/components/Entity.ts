import { Types, defineComponent } from 'bitecs'

export const Entity = defineComponent({
  gridX: Types.i32,
  gridY: Types.i32,
  // weapon: Types.f32,
  // health: Types.f32,
  roundCoin: Types.i32,
  rank: Types.i32,
  teamIndex: Types.i32,
  gerbId: Types.i32,
  /**
   * ID захваченной сущности
   */
  target: Types.i32,
  targetDistance: Types.i32,
  /**
   * X точки назначения
   */
  targetGridX: Types.i32,
  /**
   * Y точки назначения
   */
  targetGridY: Types.i32
  // isPlayer: Types.i32
  // bulletLevel: Types.f32
})

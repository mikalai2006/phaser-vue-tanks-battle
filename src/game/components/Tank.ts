import { Types, defineComponent } from 'bitecs'

export const Tank = defineComponent({
  // texture: Types.ui8,
  index: Types.ui8,
  // levelTower: Types.ui8,
  // levelMuzzle: Types.ui8,
  activeWeaponType: Types.f32,
  timeBeforeShoot: Types.f32,

  health: Types.f32,
  speed: Types.f32,
  speedRotate: Types.f32,
  speedRotateTower: Types.f32,
  distanceView: Types.f32,
  accuracy: Types.f32,
  speedShot: Types.f32,
  timeRefreshWeapon: Types.f32,
  distanceShot: Types.f32,

  maxHealth: Types.f32,
  maxSpeed: Types.f32,
  maxSpeedRotate: Types.f32,
  maxSpeedRotateTower: Types.f32,
  maxDistanceView: Types.f32,
  maxAccuracy: Types.f32,
  maxSpeedShot: Types.f32,
  maxTimeRefreshWeapon: Types.f32,
  maxDistanceShot: Types.f32
  // distanceTarget: Types.i32
})

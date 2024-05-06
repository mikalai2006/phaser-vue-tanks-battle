// PLANCK UTILITIES

import { GameOptions } from '../options/gameOptions'

// simple function to convert pixels to meters
export function toMeters(n: number): number {
  return n / GameOptions.Box2D.worldScale
}

// simple function to convert meters to pixels
export function toPixels(n: number): number {
  return n * GameOptions.Box2D.worldScale
}

export function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

import * as Bones from '../bones'
import { Coordinate } from './coordinate'
export const UP = new Coordinate(0, -1)
export const DOWN = new Coordinate(0, 1)
export const LEFT = new Coordinate(-1, 0)
export const RIGHT = new Coordinate(1, 0)

export const UP_LEFT = new Coordinate(-1, -1)
export const DOWN_LEFT = new Coordinate(-1, 1)
export const UP_RIGHT = new Coordinate(1, -1)
export const DOWN_RIGHT = new Coordinate(1, 1)
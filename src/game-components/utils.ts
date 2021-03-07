import * as ROT from 'rot-js/lib/index'
import { Coordinate } from './coordinate'

let MAX_GRID_SIZE = 1024

export function xyToKey(xy: Coordinate) : number {
    return (xy.y * MAX_GRID_SIZE) + xy.x
} 

export function keyToXY(key: number) : Coordinate {
    // return new Coordinate(key % MAX_GRID_SIZE, Math.floor(key / MAX_GRID_SIZE))
    return new Coordinate(ROT.Util.mod(key, MAX_GRID_SIZE), Math.floor(key / MAX_GRID_SIZE))
}

export function x_and_yToKey(x : number, y: number) : number {
    return (y * MAX_GRID_SIZE) + x
} 

let init_id = 1000
export function generateID() : number {
    init_id += 1
    return init_id
}

export interface ISize {
    width: number
    height: number
}

export function dist2d(from_xy: Coordinate, to_xy: Coordinate) : number {
    let xdiff = (from_xy.x - to_xy.x)
    let ydiff = (from_xy.y - to_xy.y)
    
    return Math.sqrt(xdiff*xdiff + ydiff*ydiff)
}
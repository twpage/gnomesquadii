import { ISize, IRect } from "./game-components/utils";
import { Coordinate } from "./bones";

//make sure one of these is odd to prevent weird camera issues
//TODO: fix weird camera issue when both are even (probably missing a -1)
export const gameplaySize : ISize = { width: 30, height: 30 } 
export const regionSize : ISize = { width: 45, height: 45 }
export const TILE_EXPANSION : number = 1.25
export const BASE_TILE_SIZE : number = 16

export const gameplayPanelRect : IRect = { 
    size: gameplaySize, 
    topleft_xy: new Coordinate(1, 1) 
}

export const infoPanelRect : IRect = {
    size: {
        width: 20,
        height: gameplaySize.height
    },
    topleft_xy: new Coordinate(gameplayPanelRect.size.width + 2, gameplayPanelRect.topleft_xy.y)
}
export const footerPanelRect : IRect = {
    size: {
        width: gameplayPanelRect.size.width + infoPanelRect.size.width + 1,
        height: 5
    },
    topleft_xy: new Coordinate(gameplayPanelRect.topleft_xy.x, gameplayPanelRect.size.height + 2)
}

export const fullWindowRect : IRect = {
    topleft_xy: new Coordinate(0, 0),
    size: {
        width: gameplayPanelRect.size.width + infoPanelRect.size.width + 3,
        height: gameplayPanelRect.size.height + footerPanelRect.size.height + 4
    }
}

export const RELATIVE_TIMEDIST_WARN = 12
export const RELATIVE_TIMEDIST_MAX = 15
export const MAX_GRID_SIZE = 1024
export const MAX_TARGET_PATH = 8

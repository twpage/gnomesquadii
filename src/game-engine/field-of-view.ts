import * as Bones from '../bones'
import { Coordinate } from '../game-components'
import { CoordinateArea } from '../game-components/coordinate-area'

// This will return a function we can plug in as a FOV callback -
function createAllowVisionFn(game: Bones.Engine.Game, actor: Bones.Entities.Actor, active_range: number) : (x, y) => boolean {
    let xy: Bones.Coordinate
    let level = game.current_region
    let t : Bones.Entities.Terrain

    let fn_allow_vision = (x: number, y: number) => { 

        xy = new Bones.Coordinate(x, y)
        
        // can never see outside the level
        if (!(level.isValid(xy))) {
            return false
        } 
        
        //  can always see where you are standing
        if (xy.compare(actor.location)) {
            return true
        }
        
        if (Bones.Utils.dist2d(actor.location, xy) > active_range) {
            return false
        }
        
        t = level.terrain.getAt(xy)
        return (!(t.blocksVision))
    }

    return fn_allow_vision
}
export function setSquadFieldOfViewFor(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : Bones.Coordinate[] {
    let old_fov : Array<Bones.Coordinate> = actor.fov.getAllCoordinates()

    actor.clearFov()
    actor.clearKnowledge()
    actor.clearMemory()

    for (let i = 0; i < game.player_squad.length; i++) {
        let squad_member = game.player_squad[i]
        updateFieldOfViewFor(game, squad_member)
        for (let fov of squad_member.fov.getAllCoordinatesAndEntities()) {
            actor.fov.setAt(fov.xy, fov.entity)
        }
        for (let knows of squad_member.knowledge.getAllCoordinatesAndEntities()) {
            actor.knowledge.setAt(knows.xy, knows.entity)
        }
        for (let memory of squad_member.memory.getAllCoordinatesAndEntities()) {
            actor.memory.setAt(memory.xy, memory.entity)
        }
    }

    let old_fov_coords = new CoordinateArea(old_fov)
    let new_fov_coords = new CoordinateArea(actor.fov.getAllCoordinates())
    let diff_xy_list = old_fov_coords.getSymmetricDiff(new_fov_coords).getCoordinates()

    return diff_xy_list
}

export function updateFieldOfViewFor(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : Bones.Coordinate[] {
    let old_fov : Array<Bones.Coordinate> = actor.fov.getAllCoordinates()
    let xy: Bones.Coordinate
    
    actor.clearFov()
    actor.clearKnowledge()

    let region = game.current_region

    let fn_allow_vision = createAllowVisionFn(game, actor, Math.max(Bones.Config.gameplaySize.width, Bones.Config.gameplaySize.height))//actor.sight_range)

    let alternative_fov_coords = new CoordinateArea()

    // let fn_update_fov = (x, y, r, visibility) => {
    let fn_update_fov = (x, y) => {
        // TODO: also update level for lightcasting
        // ye_level.setLightAt(new Brew.Coordinate(x, y), 1)
        xy = new Coordinate(x, y)
        if (region.isValid(xy)) {
            
            if (actor.fov.hasAt(xy)) {
                let view_type = actor.fov.getAt(xy)
                if (view_type != Bones.Enums.VisionSource.Self) {
                    actor.fov.removeAt(xy)
                    alternative_fov_coords.addCoordinate(xy)
                }
            }
            
            actor.fov.setAt(xy, Bones.Enums.VisionSource.Self)
            actor.memory.setAt(xy, region.terrain.getAt(xy))

            // check for monsters and add them to our knowledge
            let m_at  = region.actors.getAt(xy)
            if (m_at) {
                // console.log(`${actor.name} knows about ${m_at.name}`)
                actor.knowledge.setAt(xy, m_at)
            }
        }
        
        return true
    }
    Bones.Engine.FOV.symmetricRecursiveShadowcasting(actor.location.x, actor.location.y, fn_allow_vision, fn_update_fov)

    let old_fov_coords = new CoordinateArea(old_fov)
    let new_fov_coords = new CoordinateArea(actor.fov.getAllCoordinates())
    let diff_xy_list = old_fov_coords.getSymmetricDiff(new_fov_coords).getCoordinates()

    return diff_xy_list
}


// An array of transforms, each corresponding to one octant.
let transforms = [
    { xx:  1, xy:  0, yx:  0, yy:  1 },
    { xx:  1, xy:  0, yx:  0, yy: -1 },
    { xx: -1, xy:  0, yx:  0, yy:  1 },
    { xx: -1, xy:  0, yx:  0, yy: -1 },
    { xx:  0, xy:  1, yx:  1, yy:  0 },
    { xx:  0, xy:  1, yx: -1, yy:  0 },
    { xx:  0, xy: -1, yx:  1, yy:  0 },
    { xx:  0, xy: -1, yx: -1, yy:  0 }
];

//  3|1
// 7 * 5
// 6 * 4
//  2|0

export function symmetricRecursiveShadowcasting_Directional(cx, cy, transparent, reveal, facing_dir_xy: Bones.Coordinate) {
    let octants : number[] = []
    //  3|1
    // 7 * 5
    // 6 * 4
    //  2|0
    if (facing_dir_xy.compare(Bones.Directions.UP)) {
        octants = [3, 1]
    } else if (facing_dir_xy.compare(Bones.Directions.DOWN)) {
        octants = [2, 0]
    } else if (facing_dir_xy.compare(Bones.Directions.LEFT)) {
        octants = [7, 6]
    } else if (facing_dir_xy.compare(Bones.Directions.RIGHT)) {
        octants = [4, 5]
    } else {
        // console.warn("invalid facing direction")
        octants = [0, 1, 2, 3, 4, 5, 6, 7]
    }

    symmetricRecursiveShadowcasting(cx, cy, transparent, reveal, octants)
}

/**
 * Recursive shadowcasting algorithm.
 * This algorithm creates a field of view centered around (x, y).
 * Opaque tiles are treated as if they have beveled edges.
 * Transparent tiles are visible only if their center is visible, so the
 * algorithm is symmetric.
 * @param cx - x coordinate of center
 * @param cy - y coordinate of center
 * @param transparent - function that takes (x, y) as arguments and returns the transparency of that tile
 * @param reveal - callback function that reveals the tile at (x, y)
 */
export function symmetricRecursiveShadowcasting  (cx, cy, transparent, reveal, octants?: number[]) {
    if (!(octants)) {
        octants = [0, 1, 2, 3, 4, 5, 6, 7]
    }
    
    /**
     * Scan one row of one octant.
     * @param y - distance from the row scanned to the center
     * @param start - starting slope
     * @param end - ending slope
     * @param transform - describes the transfrom to apply on x and y; determines the octant
     */
    let scan = (y: number, start: number, end: number, transform: any) => {
        if (start >= end) {
            return
        }
        let xmin = Math.round((y - 0.5) * start)
        let xmax = Math.ceil((y + 0.5) * end - 0.5)
        for (let x = xmin; x <= xmax; x++) {
            let realx = cx + transform.xx * x + transform.xy * y
            let realy = cy + transform.yx * x + transform.yy * y
            if (transparent(realx, realy)) {
                if (x >= y * start && x <= y * end) {
                    reveal(realx, realy)
                }
            } else {
                if (x >= (y - 0.5) * start && x - 0.5 <= y * end) {
                    reveal(realx, realy)
                }
                scan(y + 1, start, (x - 0.5) / y, transform)
                start = (x + 0.5) / y
                if (start >= end) {
                    return
                }
            }
        }
        scan(y + 1, start, end, transform)
    }

    reveal(cx, cy)
    // Scan each octant
    for (var i = 0; i < 8; i++) {
        if (octants.indexOf(i) > -1) {
            scan(1, 0, 1, transforms[i])
        }
    }
}

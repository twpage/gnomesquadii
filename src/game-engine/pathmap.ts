import * as Bones from '../bones'
import * as FDM from './fastdijkstramap'
import { GridOfEntities } from '../game-components/grid'

export enum PathmapGoalType {
    ToTarget,
    EscapeTarget
}

interface IPathmapCache {
    [id: string] : Pathmap
}

// todo: find other instances of cacheing stuff like this and generalize the class <T>
export class PathmapCache {
    my_pathmaps: IPathmapCache = {}

    updateCache(cacheType : Bones.Enums.PathmapCacheType, pm: Pathmap) {
        this.my_pathmaps[cacheType] = pm
    }

    getPathmap(cacheType: Bones.Enums.PathmapCacheType) {
        if (cacheType in this.my_pathmaps) {
            return this.my_pathmaps[cacheType]
        } else {
            return null
        }
    }

    // getPathmapCacheType(goalType: PathmapGoalType, includeAllies: boolean, navigationMethod: Brew.Enums.LevelNavigationType) : PathmapCacheType {
    //     let cacheType : PathmapCacheType

    //     if ((goalType == PathmapGoalType.EscapeTarget) && (includeAllies == true) && (navigationMethod == Brew.Enums.LevelNavigationType.Fly)) {
    //         cacheType = PathmapCacheType.FromPlayerAllies_Fly
    //     } else if ((goalType == PathmapGoalType.EscapeTarget) && (includeAllies == true) && (navigationMethod == Brew.Enums.LevelNavigationType.Walk)) {
    //         cacheType = PathmapCacheType.FromPlayerAllies_Walk
    //     } else if ((goalType == PathmapGoalType.EscapeTarget) && (includeAllies == false) && (navigationMethod == Brew.Enums.LevelNavigationType.Fly)) {
    //         cacheType = PathmapCacheType.FromPlayerOnly_Fly
    //     } else if ((goalType == PathmapGoalType.EscapeTarget) && (includeAllies == false) && (navigationMethod == Brew.Enums.LevelNavigationType.Walk)) {
    //         cacheType = PathmapCacheType.FromPlayerOnly_Walk
    //     } else if ((goalType == PathmapGoalType.ToTarget) && (includeAllies == true) && (navigationMethod == Brew.Enums.LevelNavigationType.Fly)) {
    //         cacheType = PathmapCacheType.ToPlayerAllies_Fly
    //     } else if ((goalType == PathmapGoalType.ToTarget) && (includeAllies == true) && (navigationMethod == Brew.Enums.LevelNavigationType.Walk)) {
    //         cacheType = PathmapCacheType.ToPlayerAllies_Walk
    //     } else if ((goalType == PathmapGoalType.ToTarget) && (includeAllies == false) && (navigationMethod == Brew.Enums.LevelNavigationType.Fly)) {
    //         cacheType = PathmapCacheType.ToPlayerOnly_Fly
    //     } else if ((goalType == PathmapGoalType.ToTarget) && (includeAllies == false) && (navigationMethod == Brew.Enums.LevelNavigationType.Walk)) {
    //         cacheType = PathmapCacheType.ToPlayerOnly_Walk
    //     }

    //     return cacheType
    // }

    // getPathmap(goalType: PathmapGoalType, includeAllies: boolean, navigationMethod: Brew.Enums.LevelNavigationType) : Pathmap {
    //     let cacheType = this.getPathmapCacheType(goalType, includeAllies, navigationMethod)
    //     return this.getCache(cacheType)
    // }
}

export class Pathmap {
    game: Bones.Engine.Game
    pathtype: PathmapGoalType
    field : GridOfEntities<number>
    width: number
    height: number
    // passable_keys_list : number[]
    // blocked_keys_lookup: Dict<boolean>
    djmap : FDM.IDijkstraMap

    // mostly for displaying debug
    max_value : number
    min_value : number 

    constructor(game: Bones.Engine.Game, level: Bones.Region, pathtype: PathmapGoalType, navigationType : Bones.Enums.LevelNavigationType = Bones.Enums.LevelNavigationType.Walk) {
        this.game = game
        this.field = new GridOfEntities<number>()
        this.pathtype = pathtype
        this.width = level.size.width
        this.height = level.size.height

        // pick a spot to start the flood fill for passable tiles
        let valid_start_xy = level.navigation_tiles[navigationType][0]
        
        // initiate the map
        let pathable_fn : FDM.IPathableFunction
        if (navigationType == Bones.Enums.LevelNavigationType.Walk) {
            pathable_fn = FDM.PathFunctionWalkable
        } else if (navigationType == Bones.Enums.LevelNavigationType.Fly) {
            pathable_fn = FDM.PathFunctionFlyable
        } else {
            throw new Error(`unknown level navigation type: ${navigationType}`)
        }

        this.djmap = FDM.setupDijkstraMap(level, valid_start_xy, pathable_fn)
    }
    
    setDijkstraMapTargets(target_xy: Bones.Coordinate, goal_value: number) {
        let key = Bones.Utils.xyToKey(target_xy)
        this.djmap[key] = goal_value
    }

    solve() {
        // run the solver
        FDM.solveDijkstraMap(this.djmap)
        
        // find max/min values
        let maxmin = FDM.getMaxAndMinDijkstraMapValues(this.djmap)
        this.max_value = maxmin.max
        this.min_value = maxmin.min
        
        // convert back to grid of things
        let key: string
        let xy: Bones.Coordinate
        // let num_key
        for (key in this.djmap) {
            xy = Bones.Utils.keyToXY(Number(key))
            this.field.setAt(xy, this.djmap[key])
        }

        // console.log(`number of passes: ${num_passes}`)
    }


    getDownhillNeighbor(from_xy: Bones.Coordinate) : Bones.Coordinate {
        let lowest_xy = from_xy
        let lowest_val = this.field.getAt(lowest_xy)
        
        lowest_xy.getAdjacent().forEach((xy:Bones.Coordinate, index, array) => {
            let temp_val = this.field.getAt(xy)
            if (temp_val) {
                if (temp_val < lowest_val) {
                    lowest_val = temp_val
                    lowest_xy = xy
                }
            }
        })
        
        return lowest_xy
    }

    // getUnblockedDownhillNeighbor(from_xy: Brew.Coordinate, level: Brew.Level, except_mob?: Brew.GridThings.Monster) : Brew.Coordinate {
    getUnblockedDownhillNeighbor(actor: Bones.Entities.Actor, from_xy: Bones.Coordinate, level: Bones.Region, ally_mode: boolean = false) : Bones.Coordinate {
        // return lowest-value cell not blocked by another something
        let lowest_xy = from_xy
        let lowest_val : number
        if (ally_mode) {
            lowest_val = Number.MAX_VALUE
        }  else {
            lowest_val = this.field.getAt(lowest_xy)
        }
        
        lowest_xy.getAdjacent().forEach((xy:Bones.Coordinate) => {
            let temp_val = this.field.getAt(xy)

            if (ally_mode && (temp_val == 0)) {
                return
            }
            
            if (temp_val) {
                let mob_at = level.actors.getAt(xy)
                if (mob_at) {
                    return
                }
                
                if (!(Bones.Actions.Movement.isValidMove(this.game, actor, xy))) {
                    return
                }
                

                if (temp_val < lowest_val) {
                    lowest_val = temp_val
                    lowest_xy = xy
                }
            }
        })
        
        return lowest_xy
    }
    
}//end class

export function createGenericMapToPlayer(gm: Bones.Engine.Game, level: Bones.Region, player : Bones.Entities.Actor, navigationMethod : Bones.Enums.LevelNavigationType, includeAllies : boolean ) : Pathmap {
    let pm = new Pathmap(gm, level, PathmapGoalType.ToTarget, navigationMethod)
    // let player = gm.getActiveSquadMember()
    
    // set player as target
    pm.setDijkstraMapTargets(player.location, 0)
    
    // set allies if necessary
    if (includeAllies) {
        level.actors.getAllEntities().forEach((m, index, array) =>{
            if (m.isPlayerControlled()) {
                pm.setDijkstraMapTargets(m.location, 0)
            }
            // if (m.team == Brew.Enums.Team.PlayerAllied) {
            //     pm.setDijkstraMapTargets(m.location, 0)
            // }
        })
    }

    pm.solve()
    return pm
}

export function createMapFromPlayer(gm: Bones.Engine.Game, level: Bones.Region, player: Bones.Entities.Actor, to_map: Pathmap, includeAllies: boolean) : Pathmap {
    let from_map = new Pathmap(gm, level, PathmapGoalType.EscapeTarget)
    let escape_factor = -1.2
    
    // let player = gm.getActiveSquadMember()
    
    // invert the to-map
    let key: string
    for (key in to_map.field.entities) {
        from_map.djmap[key] = to_map.djmap[key] * escape_factor
    }

    // reset player to high peak
    from_map.setDijkstraMapTargets(player.location, FDM.MAX_INT)

    // set allies if necessary
    if (includeAllies) {
        level.actors.getAllEntities().forEach((m, index, array) =>{
            if (m.isPlayerControlled()) {
                from_map.setDijkstraMapTargets(m.location, FDM.MAX_INT)
            }
            // if (m.team == Brew.Enums.Team.PlayerAllied) {
            //     from_map.setDijkstraMapTargets(m.location, FDM.MAX_INT)
            // }
        })
    }

    from_map.solve()
    return from_map
}

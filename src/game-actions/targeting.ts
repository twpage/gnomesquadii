import * as Bones from '../bones'
import { EventType, TargetingType } from '../game-enums/enums'
import { GridOfEntities } from '../game-components/grid'
import { GameEvent } from '../game-engine/events'
import { targeting_target } from '../game-components/color'

export function execTargetingStart(game: Bones.Engine.Game, actor: Bones.Entities.Actor, start_xy: Bones.Coordinate, end_xy: Bones.Coordinate, targeting_type: TargetingType, associated_ability: Bones.Actions.Abilities.Ability) : boolean {
    game.tgt_interface = new Bones.Actions.Targeting.TargetingInterface(game, actor, targeting_type, associated_ability, start_xy, end_xy)
    game.tgt_interface.updateHighlights()
    Bones.Engine.setActiveInputHandler(Bones.Enums.InputHandlerType.Targeting)

    return true
}

export function execTargetingCancel(game: Bones.Engine.Game, actor: Bones.Entities.Actor, parent_event: GameEvent) : boolean {
    let existing_xys = game.tgt_interface.highlights.getAllCoordinates()
    game.tgt_interface.cancel()
    game.tgt_interface = null
    game.display.drawList(existing_xys)
    Bones.Engine.setActiveInputHandler(Bones.Enums.InputHandlerType.Core)

    return true
}

export function execTargetingEnd(game: Bones.Engine.Game, actor: Bones.Entities.Actor, parent_event: GameEvent) : boolean {
    let resp = isValidPath(game, game.tgt_interface.targetingType, game.tgt_interface.start_xy, game.tgt_interface.target_xy)
    let region : Bones.Region
    let target_at : Bones.Entities.Actor

    if (resp.valid) {
        switch (game.tgt_interface.associated_ability.abil_type) {
            case Bones.Enums.AbilityType.Examine:
                console.log("hrmmm")
                break
            
            case Bones.Enums.AbilityType.Shoot:
                region = game.current_region
                target_at = region.actors.getAt(game.tgt_interface.target_xy)
                game.tgt_interface.associated_ability.charges.decrement(1)
                game.addEventToQueue(new GameEvent(actor, EventType.ATTACK, true, {
                    from_xy: game.tgt_interface.start_xy,
                    to_xy: game.tgt_interface.target_xy,
                    target: target_at
                }))
                game.display.drawFooterPanel()
                break

            case Bones.Enums.AbilityType.Bullseye:
                region = game.current_region
                target_at = region.actors.getAt(game.tgt_interface.target_xy)
                game.tgt_interface.associated_ability.charges.decrement(1)
                game.addEventToQueue(new GameEvent(actor, EventType.CRIT_SHOT, true, {
                    from_xy: game.tgt_interface.start_xy,
                    to_xy: game.tgt_interface.target_xy,
                    target: target_at
                }))
                game.display.drawFooterPanel()
                break
        }
    } else {
        game.addEventToQueue(new GameEvent(actor, EventType.NONE, false, { errMsg: "Invalid target" }))
    }

    let ok = execTargetingCancel(game, actor, parent_event)
    return ok
}

export function execTargetingMove(game: Bones.Engine.Game, actor: Bones.Entities.Actor, target_xy: Bones.Coordinate) : boolean {
    let existing_xys = game.tgt_interface.highlights.getAllCoordinates()

    game.tgt_interface.move(target_xy)
    game.tgt_interface.updateHighlights()
    game.display.drawList(game.tgt_interface.highlights.getAllCoordinates().concat(existing_xys))

    return true
}

interface ITargetingResponse {
    valid: boolean
    path: Bones.Coordinate[]
}
export function isValidPath(game: Bones.Engine.Game, tgt_type: TargetingType, start_xy: Bones.Coordinate, target_xy: Bones.Coordinate) : ITargetingResponse {
    switch (tgt_type) {
        case TargetingType.Shoot:
            return isValidPath_Shoot(game, start_xy, target_xy)
        case TargetingType.Bullseye:
            return isValidPath_Shoot(game, start_xy, target_xy)
        default:
            return isValidPath_Examine(game, start_xy, target_xy)
    }
}
 
export function isValidPath_Examine(game: Bones.Engine.Game, start_xy: Bones.Coordinate, target_xy: Bones.Coordinate) : ITargetingResponse {
    return {
        valid: true,
        path: [target_xy]
    }
}
export function isValidPath_Shoot(game: Bones.Engine.Game, start_xy: Bones.Coordinate, target_xy: Bones.Coordinate) : ITargetingResponse {
    // first see if the path is valid
    let path_resp = isValidPath_UnblockedStraightLine(game, start_xy, target_xy)
    if (!(path_resp.valid)) { return path_resp }

    let max_path = Bones.Config.MAX_TARGET_PATH

    if (path_resp.path.length >= max_path) {
        // console.log("length too long")
        let path2 = path_resp.path.concat([])
        let last_part = path2.pop()
        // let end_of_path = path2.
        return {
            valid: false,
            path: path_resp.path.slice(0, max_path).concat([last_part])
        }
    }

    // then see if there's a monster at the end
    let region = game.current_region
    let mob_at = region.actors.getAt(target_xy)
    if (!(mob_at)) {
        return {
            valid: false,
            path: path_resp.path
        }
    }

    return path_resp
}

export function isValidPath_UnblockedStraightLine(game: Bones.Engine.Game, start_xy: Bones.Coordinate, target_xy: Bones.Coordinate) : ITargetingResponse {
    let line = Bones.Shapes.getLine(start_xy, target_xy)
    
    if (line.length == 0) {
        return {
            valid: false,
            path: []
        }
    }
    
    let region = game.current_region

    for (let i = 0; i < line.length; i++) {
        let xy = line[i]
        let terrain_at = region.terrain.getAt(xy)
        if ((terrain_at.blocksWalking) || (terrain_at.blocksVision)) {
            return {
                valid: false,
                path: line//[]
            }
        }

        let mob_at = region.actors.getAt(xy)
        if ((mob_at) && (!(mob_at.location.compare(line[0]))) && (!(mob_at.location.compare(line[line.length-1])))) {
            return {
                valid: false,
                path: line//[]
            }
        }
    }

    return {
        valid: true,
        path: line
    }
}

export class TargetingInterface{
    highlights : GridOfEntities<Bones.ROTColor>

    constructor (
        public game: Bones.Engine.Game,
        // public parent_event: GameEvent,
        public initiated_by: Bones.Entities.Actor,
        public targetingType: TargetingType,
        public associated_ability: Bones.Actions.Abilities.Ability,
        public start_xy: Bones.Coordinate,
        public target_xy: Bones.Coordinate,
    ) {
        this.highlights = new GridOfEntities<Bones.ROTColor>()
    }

    updateHighlights() {
        this.highlights.clearAll()

        if (this.targetingType == TargetingType.Examine) {
            this.highlights.setAt(this.target_xy, Bones.Color.targeting_target)

        } else if ((this.targetingType == TargetingType.Shoot) || (this.targetingType == TargetingType.Bullseye)) {
            let resp = isValidPath(this.game, this.targetingType, this.start_xy, this.target_xy)

            // if (!(resp.valid)) {
            //     this.highlights.setAt(this.target_xy, Bones.Color.targeting_bad)

            // } else {
            let line = resp.path
            for (let i = 0; i < line.length; i++) {
                let line_color = (resp.valid ? Bones.Color.targeting_path : Bones.Color.targeting_bad_path)
                // let line_color = Bones.Color.targeting_path

                if (i == (line.length - 1)) {
                    line_color = (resp.valid ? Bones.Color.targeting_target : Bones.Color.targeting_bad_target)
                    // line_color = Bones.Color.targeting_target
                }
                this.highlights.setAt(line[i], line_color)
            }
            // }
        }
        
    }

    move(new_target_xy: Bones.Coordinate) {
        this.target_xy = new_target_xy
    }

    cancel() {
        this.highlights.clearAll()
    }
    
}

export function guessStartingTarget(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : Bones.Coordinate {
    let potential_targets  = actor.knowledge.getAllCoordinatesAndEntities().filter(item => { return (!(item.entity.isPlayerControlled())) })
    console.log(potential_targets)
        // find the closest one 
    let targets : Bones.Entities.Actor[] = potential_targets.sort((a, b) => {
        let dist_me_to_a = Bones.Utils.dist2d(actor.location, a.xy)
        let dist_me_to_b = Bones.Utils.dist2d(actor.location, b.xy)
        if (dist_me_to_a == dist_me_to_b) {
            return a.entity.id - b.entity.id
        } else {
            return dist_me_to_a - dist_me_to_b
        }
    }).map(item => { return item.entity })

    if (targets.length == 0) {
        // if we don't see anyone, then return 0,0
        return new Bones.Coordinate(0, 0)
    } else {
        return targets[0].location.subtract(actor.location)
    }
}
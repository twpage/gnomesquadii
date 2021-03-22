import * as Bones from '../bones'
import { EventType, TargetingType } from '../game-enums/enums'
import { GridOfEntities } from '../game-components/grid'
import { GameEvent } from '../game-engine/events'
import { targeting_target } from '../game-components/color'

export function execTargetingStart(game: Bones.Engine.Game, actor: Bones.Entities.Actor, start_xy: Bones.Coordinate, end_xy: Bones.Coordinate, targeting_type: TargetingType, associated_ability: Bones.Actions.Abilities.Ability) : boolean {
    game.tgt_interface = new Bones.Actions.Targeting.TargetingInterface(game, actor, start_xy, end_xy, targeting_type, associated_ability)
    game.tgt_interface.updateHighlights()
    // game.display.drawList(game.tgt_interface.highlights.getAllCoordinates())
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
    if (game.tgt_interface.targetingType == Bones.Enums.TargetingType.Shoot) {
        // TODD WUZ HERE
        let resp = isValidPath(game, game.tgt_interface.targetingType, game.tgt_interface.start_xy, game.tgt_interface.target_xy)
        if (!(resp.valid)) {
            game.addEventToQueue(new GameEvent(actor, EventType.NONE, false, { errMsg: "Invalid target" }))
        } else {
            let region = game.current_region
            let target_at = region.actors.getAt(game.tgt_interface.target_xy)
            game.addEventToQueue(new GameEvent(actor, EventType.ATTACK, true, {
                from_xy: game.tgt_interface.start_xy,
                to_xy: game.tgt_interface.target_xy,
                target: target_at
            }))
        }
    } else if (game.tgt_interface.targetingType == Bones.Enums.TargetingType.Examine) {
        console.log("hrmmm")
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
                path: []
            }
        }

        let mob_at = region.actors.getAt(xy)
        if ((mob_at) && (!(mob_at.location.compare(line[0]))) && (!(mob_at.location.compare(line[line.length-1])))) {
            return {
                valid: false,
                path: []
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
        public initiated_by: Bones.Entities.Actor,
        public associated_ability: Bones.Actions.Abilities.Ability,
        // public targetingType: TargetingType,
        public start_xy: Bones.Coordinate,
        public target_xy: Bones.Coordinate,
    ) {
        this.highlights = new GridOfEntities<Bones.ROTColor>()
    }

    updateHighlights() {
        this.highlights.clearAll()

        if (this.targetingType == TargetingType.Examine) {
            this.highlights.setAt(this.target_xy, Bones.Color.targeting_target)

        } else if (this.targetingType == TargetingType.Shoot) {
            let resp = isValidPath(this.game, this.targetingType, this.start_xy, this.target_xy)

            if (!(resp.valid)) {
                this.highlights.setAt(this.target_xy, Bones.Color.targeting_bad)

            } else {
                let line = resp.path
                for (let i = 0; i < line.length; i++) {
                    let line_color = Bones.Color.targeting_path
                    if (i == (line.length - 1)) {
                        line_color = Bones.Color.targeting_target
                    }
                    this.highlights.setAt(line[i], line_color)
                }
            }
        }
        
    }

    move(new_target_xy: Bones.Coordinate) {
        this.target_xy = new_target_xy
    }

    cancel() {
        this.highlights.clearAll()
    }
    
}
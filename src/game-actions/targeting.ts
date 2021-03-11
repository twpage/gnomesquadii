import * as Bones from '../bones'
import { TargetingType } from '../game-enums/enums'
import { GridOfEntities } from '../game-components/grid'

export function execTargetingStart(game: Bones.Engine.Game, actor: Bones.Entities.Actor, targeting_type: TargetingType, start_xy: Bones.Coordinate, end_xy: Bones.Coordinate) : boolean {
    game.tgt_interface = new Bones.Actions.Targeting.TargetingInterface(start_xy, end_xy, targeting_type)
    game.tgt_interface.updateHighlights()
    // game.display.drawList(game.tgt_interface.highlights.getAllCoordinates())
    Bones.Engine.setActiveInputHandler(Bones.Enums.InputHandlerType.Targeting)
    return true
}

export function execTargetingEnd(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : boolean {
    let existing_xys = game.tgt_interface.highlights.getAllCoordinates()
    game.tgt_interface.cancel()
    game.tgt_interface = null
    game.display.drawList(existing_xys)
    Bones.Engine.setActiveInputHandler(Bones.Enums.InputHandlerType.Core)
    return true
}

export function execTargetingMove(game: Bones.Engine.Game, actor: Bones.Entities.Actor, target_xy: Bones.Coordinate) : boolean {
    let existing_xys = game.tgt_interface.highlights.getAllCoordinates()

    game.tgt_interface.move(target_xy)
    game.tgt_interface.updateHighlights()
    game.display.drawList(game.tgt_interface.highlights.getAllCoordinates().concat(existing_xys))

    return true
}

export class TargetingInterface{
    highlights : GridOfEntities<Bones.ROTColor>

    constructor (
        public start_xy: Bones.Coordinate,
        public target_xy: Bones.Coordinate,
        public targetingType: TargetingType
    ) {
        this.highlights = new GridOfEntities<Bones.ROTColor>()
    }

    updateHighlights() {
        this.highlights.clearAll()
        // if (this.targetingType == TargetingType.Examine) {
        
        this.highlights.setAt(this.target_xy, Bones.Color.hero_color)
    }

    move(new_target_xy: Bones.Coordinate) {
        this.target_xy = new_target_xy
    }

    cancel() {
        this.highlights.clearAll()
    }
    
}
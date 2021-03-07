import * as Bones from '../bones'

export function isValidMove(game: Bones.Engine.Game, actor: Bones.Entities.Actor, to_xy: Bones.Coordinate) : boolean {
    let region = game.current_region
    let terrain_at = region.terrain.getAt(to_xy)
    if (terrain_at.code == '#') {
        return false
    } else {
        return true
    }
}

export function execMove(game: Bones.Engine.Game, actor: Bones.Entities.Actor, from_xy: Bones.Coordinate, to_xy: Bones.Coordinate) : boolean {
    let region = game.current_region
    region.actors.removeAt(from_xy)
    region.actors.setAt(to_xy, actor)

    game.display.drawList([from_xy, to_xy])

    actor.lastStepOffset = to_xy.subtract(from_xy)
    return true
}
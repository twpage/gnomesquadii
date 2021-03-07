import * as Bones from '../bones'

export function execAttack(game: Bones.Engine.Game, actor: Bones.Entities.Actor, from_xy: Bones.Coordinate, to_xy: Bones.Coordinate, target: Bones.Entities.Actor) : boolean {
    console.log(`${actor.name} attacks ${target.name}`)
    let region = game.current_region
    region.actors.removeAt(to_xy)
    game.scheduler.remove(target)
    game.display.drawPoint(to_xy)
    return true
}
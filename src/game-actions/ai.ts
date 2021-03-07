import * as ROT from 'rot-js'
import * as Bones from '../bones'
import { InputResponse } from '../game-engine';
import { GameEvent } from '../game-engine/events';
import { ActorType } from '../game-enums/enums';

export function getEventOnMonsterTurn(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : InputResponse {
    let mob_event : InputResponse

    if (actor.actorType == ActorType.ARCHITECT) {
        mob_event = {validInput: true, actualEvent: new GameEvent(actor, Bones.Enums.EventType.GAMETICK, true)}

    } else {
        // find all of the player targets that we know about
        let potential_targets  = actor.knowledge.getAllCoordinatesAndEntities().filter(item => { return item.entity.isPlayerControlled() })

        // find the closest one 
        let targets : Bones.Entities.Actor[] = potential_targets.sort((a, b) => {
            let dist_me_to_a = Bones.Utils.dist2d(actor.location, a.xy)
            let dist_me_to_b = Bones.Utils.dist2d(actor.location, b.xy)
            return dist_me_to_b - dist_me_to_a
        }).map(item => { return item.entity })

        if (targets.length == 0) {
            // if we don't see anyone, then wait
            mob_event  = {validInput: true, actualEvent: new GameEvent(actor, Bones.Enums.EventType.WAIT, true)}

        } else {
            // we DO see someone
            let target = targets[0]

            // let's see if we can attack them
            let in_melee_range = Bones.Utils.dist2d(actor.location, target.location) == 1
            
            if (in_melee_range) {
                // attack!
                mob_event  = {validInput: true, actualEvent: new GameEvent(actor, Bones.Enums.EventType.ATTACK, true, {from_xy: actor.location, to_xy: target.location, target: target})}

            } else {
                // otherwise, walk towards them

                // use ROT.js pathfinding to take the next step towards our target
                let region = game.current_region
                let passable_fn = (x: number, y: number) => {
                    let xy = new Bones.Coordinate(x, y)
                    return region.isValid(xy) && Bones.Actions.Movement.isValidMove(game, actor, xy)
                }

                let path_taken_xys : Bones.Coordinate[] =  []
                let fn_update_path = (x: number, y: number) : void => {
                    // let xy = new Brew.Coordinate(x, y)
                    path_taken_xys.push(new Bones.Coordinate(x, y))
                }
                let dijkstra = new ROT.Path.Dijkstra(target.location.x, target.location.y, passable_fn, {topology: 4})
                dijkstra.compute(actor.location.x, actor.location.y, fn_update_path)
                if (path_taken_xys.length <= 1) {
                    // no valid path to get there, just wait
                    mob_event  = {validInput: true, actualEvent: new GameEvent(actor, Bones.Enums.EventType.WAIT, true)}
                } else {
                    // take our first step
                    let next_step_xy = path_taken_xys[1]
                    mob_event  = {validInput: true, actualEvent: new GameEvent(actor, Bones.Enums.EventType.MOVE, true, {from_xy: actor.location, to_xy: next_step_xy})}
                }
            }
        }
    }

    return mob_event
}

export function execGameTick(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : boolean {
    let region = game.current_region

    // are the monsters all gone?
    let found_mobs = game.current_region.actors.getAllEntities().filter((mob) => { return mob.actorType == ActorType.MOB })
    if (found_mobs.length == 0) {
        // make some more
        let safe_xys = ROT.RNG.shuffle(region.getWalkableTerrainWithoutActors())
        let used_xys : Bones.Coordinate[] = []

        for (let i = 0; i < 2; i++) {
            let mob = new Bones.Entities.Actor(Bones.Definitions.Actors.MOB)
            let safe_xy = safe_xys.pop()
            region.actors.setAt(safe_xy, mob)
            game.scheduler.add(mob, true) // need to add to scheduler manually since we already started the region
            used_xys.push(safe_xy)
        }
        game.display.drawList(used_xys)
    }

    // did the player die??
    let found_player = game.current_region.actors.getAllEntities().filter((mob) => { return mob instanceof Bones.Entities.PlayerActor })
    if (found_player.length == 0) {
        // bring the player back

        let safe_xys = ROT.RNG.shuffle(region.getWalkableTerrainWithoutActors())
        let safe_xy = safe_xys.pop()
        region.actors.setAt(safe_xy, game.player)
        game.scheduler.add(game.player, true) // need to add to scheduler manually since we already started the region
    }

    return true
}
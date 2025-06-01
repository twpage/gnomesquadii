import * as Bones from '../bones'
import { GameEvent, IEventData } from '../game-engine/events'
import { EventType } from '../game-enums/enums'

export function isValidMove(game: Bones.Engine.Game, actor: Bones.Entities.Actor, to_xy: Bones.Coordinate) : boolean {
    let region = game.current_region
    let terrain_at = region.terrain.getAt(to_xy)
    if (terrain_at.code == '#') {
        return false
    } else {
        return true
    }
}

export function execWait(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : boolean {
    // only restore stamina if not being attacked
    let mob_attack = false
    for (let axy of actor.location.getAdjacent()) {
        if (game.current_region.isValid(axy)) {
            let mob_at = game.current_region.actors.getAt(axy)
            if (mob_at) {
                if (!(mob_at.isSameAs(actor))) {
                    if (!(mob_at.isPlayerControlled())) {
                        mob_attack = true
                        break   
                    }
                }
            }
        }
    }

    if (mob_attack) {
        return false
    } else {
        if ((actor.stamina.getMaxLevel() > 1) && (!(actor.stamina.isMaxed()))) {
            actor.stamina.increment(1)
            game.display.drawInfoPanel()
        }
        return true    
    }
}


export function execMove(game: Bones.Engine.Game, actor: Bones.Entities.Actor, from_xy: Bones.Coordinate, to_xy: Bones.Coordinate, is_following: boolean=false) : boolean {
    let region = game.current_region
    region.actors.removeAt(from_xy)
    region.actors.setAt(to_xy, actor)

    game.display.drawList([from_xy, to_xy])

    actor.lastStepOffset = to_xy.subtract(from_xy)

    if (actor.isPlayerControlled()) {
        let pactor = <Bones.Entities.PlayerActor>actor
        
        if (pactor.isLeader()) {
            pactor.pathmap = Bones.Engine.Pathmap.createGenericMapToPlayer(
                game,
                game.current_region,
                actor,
                Bones.Enums.LevelNavigationType.Walk,
                false
            )

            for (let follower of Bones.Actions.Squad.getSquadFollowers(game)) {
                game.addEventToQueue(new GameEvent(
                    follower,
                    Bones.Enums.EventType.FOLLOW_LEADER,
                    false,
                    {
                        to_xy: pactor.location,
                        target: pactor
                    }))
            }
        }
    }

    if (is_following) {
        actor.turn_count += 1
    }
    
    return true
}

export function getEventFromAttemptedMove(game: Bones.Engine.Game, active_actor: Bones.Entities.Actor, dir_xy: Bones.Coordinate) : GameEvent {
    let region = game.current_region
    let new_xy = active_actor.location.add(dir_xy)
    let intended_event : GameEvent

    // first see if it is a valid coordinate
    let is_valid_coord = region.isValid(new_xy)
    if (is_valid_coord) {

        // is there a monster there?
        let mob_at = region.actors.getAt(new_xy)
        if (mob_at) {
            // cant move into your own guy - change to swap
            if (mob_at.actorType == Bones.Enums.ActorType.HERO) {
                // intended_event = new GameEvent(active_actor, EventType.NONE, false, {errMsg: "Someone is in the way"})
                intended_event = new GameEvent(active_actor, EventType.SWAP, true, {
                    from_xy: active_actor.location.clone(),
                    to_xy: new_xy,
                    target: mob_at
                })
            } else {
                intended_event = new GameEvent(active_actor, EventType.ATTACK, true, {
                    target: mob_at,
                    from_xy: active_actor.location.clone(),
                    to_xy: new_xy
                })
            }
        } else {
            // no monster there, just attempt regular movement
            let is_valid = Bones.Actions.Movement.isValidMove(game, active_actor, new_xy)
            if (is_valid) {
                let eventData: IEventData = {
                    from_xy: active_actor.location.clone(),
                    to_xy: new_xy
                }
                intended_event = new GameEvent(active_actor, EventType.MOVE, true, eventData)
            } else {
                intended_event = new GameEvent(active_actor, EventType.NONE, false, {errMsg: "You can't move there"})
            }
        }

    } else {
        intended_event = new GameEvent(active_actor, EventType.NONE, false, {errMsg: "There's nothing there"})
    }

    return intended_event
}

export function execSwap(game: Bones.Engine.Game, actor: Bones.Entities.Actor, from_xy: Bones.Coordinate, to_xy: Bones.Coordinate, swap_target: Bones.Entities.Actor) : boolean {
    let region = game.current_region
    region.actors.removeAt(from_xy)
    region.actors.removeAt(to_xy)

    region.actors.setAt(to_xy, actor)
    region.actors.setAt(from_xy, swap_target)

    game.display.drawList([from_xy, to_xy])

    actor.lastStepOffset = to_xy.subtract(from_xy)

    return true
}
import * as ROT from 'rot-js'
import * as Bones from '../bones'
import { InputResponse, Game } from '../game-engine';
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
            if (dist_me_to_a == dist_me_to_b) {
                return a.entity.id - b.entity.id
            } else {
                return dist_me_to_a - dist_me_to_b
            }
        }).map(item => { return item.entity })

        if (targets.length == 0) {
            // if we don't see anyone, then wait
            mob_event  = {validInput: true, actualEvent: new GameEvent(actor, Bones.Enums.EventType.WAIT, true)}

        } else {
            // we DO see someone
            let target = targets[0]
            
            // let's see if we can attack them
            let in_melee_range = Bones.Utils.dist2d(actor.location, target.location) == 1
            // console.log(targets)
            // console.log(target, in_melee_range)
            if (in_melee_range) {
                // attack!
                mob_event  = {validInput: true, actualEvent: new GameEvent(actor, Bones.Enums.EventType.ATTACK, true, {from_xy: actor.location, to_xy: target.location, target: target})}

            } else {
                // otherwise, walk towards them

                // use ROT.js pathfinding to take the next step towards our target
                let region = game.current_region
                let passable_fn = (x: number, y: number) => {
                    let xy = new Bones.Coordinate(x, y)
                    let mob_at = region.actors.getAt(xy)
                    let impassible_mob_at = ((mob_at) && (!(mob_at.isSameAs(actor))))
                    return region.isValid(xy) && Bones.Actions.Movement.isValidMove(game, actor, xy) && (!(impassible_mob_at))
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
    // let found_mobs = game.current_region.actors.getAllEntities().filter((mob) => { return mob.actorType == ActorType.MOB })
    // if (found_mobs.length == 0) {
    
    // every 200 turns, increase difficulty
    if (ROT.Util.mod(actor.turn_count, 100) == 0) {
        game.display.drawFooterPanel()
        game.difficulty += 1
    }

    if (ROT.Util.mod(actor.turn_count, 50) == 0) {
        // make some more
        let safe_xys = ROT.RNG.shuffle(region.getWalkableTerrainWithoutActors())
        let used_xys : Bones.Coordinate[] = []

        // game.difficulty += 1

        for (let squad_no = 0; squad_no < 2; squad_no++) {

            console.log(`mob squad number ${squad_no+1}`)
            let center_xy : Bones.Coordinate
            while (true) {
                center_xy = ROT.RNG.getItem(safe_xys)
                // make sure we didnt magically appear next to players
                let too_close = false
                for (let squaddie of game.player_squad) {
                    let d = Bones.Utils.dist2d(squaddie.location, center_xy)
                    if (d < 10) { 
                        too_close = true
                        break
                    }
                }
                if (!(too_close)) {
                    break
                }
                // if (Bones.Utils.dist2d(region.start_xy, center_xy) >= 10) {
                //     break
            } 
            
            let mob_squad = Bones.LevelGen.createMobSquad(game.difficulty)
            let mob_xys = [center_xy].concat(region.getSafeSpotsCloseTo(center_xy, mob_squad.length - 1))
            for (let m = 0; m < mob_squad.length; m++) {
                let mob = mob_squad[m]
                let xy = mob_xys[m]
                region.actors.setAt(xy, mob)
                game.scheduler.add(mob, true) // need to add to scheduler manually since we already started the region
                used_xys.push(xy)
    
                console.log(`landing ${mob.name} at ${xy}`)
            }

        }
        game.display.drawList(used_xys)
    }

    // did the player die??
    let found_heroes = game.current_region.actors.getAllEntities().filter((mob) => { return mob.actorType == ActorType.HERO })
    if (found_heroes.length == 0) {
        // bring the player back
        let new_squaddie = new Bones.Entities.PlayerActor(Bones.Definitions.Actors.HERO)
        let safe_xys = ROT.RNG.shuffle(region.getWalkableTerrainWithoutActors())
        let safe_xy = safe_xys.pop()
        region.actors.setAt(safe_xy, new_squaddie)
        game.display.drawPoint(safe_xy)
        game.player_squad = [new_squaddie]
        game.active_squad_index = 0
        // game.scheduler.add(game.player, true) // need to add to scheduler manually since we already started the region
    }

    return true
}
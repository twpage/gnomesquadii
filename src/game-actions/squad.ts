import * as Bones from '../bones'
import { GameEvent } from '../game-engine/events'
import { TYPE_NEWLINE } from 'rot-js/lib/text'
import { AbilityType } from '../game-enums/enums'

export function getSquadMemberIndexFor(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : number {
    let squad_ids_lst = game.player_squad.map(a => { return a.id })
    let index = squad_ids_lst.indexOf(actor.id)
    return index
}

interface ITimeDistForSquadMember {
    id: number,
    turns: number,
    xy: Bones.Coordinate
}

function getTimeDistValuesForSquad(game: Bones.Engine.Game) : ITimeDistForSquadMember[] {
    let timedistvalues_lst : ITimeDistForSquadMember[] = []
    
    for (let a of game.player_squad) {
        timedistvalues_lst.push({
            id: a.id,
            turns: a.turn_count,
            xy: a.location
        })
    }
    // console.log(timedistvalues_lst)
    return timedistvalues_lst
}

function getPredictedTimeDistValuesForSquad(game: Bones.Engine.Game, actor: Bones.Entities.Actor, predicted_xy: Bones.Coordinate) : ITimeDistForSquadMember[] {
    let squad_timediff_values = getTimeDistValuesForSquad(game)
    let predicted_squad_timediff_values :ITimeDistForSquadMember[] = []
    
    for (let td of squad_timediff_values) {
        if (td.id == actor.id) {
            let new_td = td
            new_td.xy = predicted_xy
            new_td.turns += 0 //1
            predicted_squad_timediff_values.push(td)
        } else {
            predicted_squad_timediff_values.push(td)
        }
    }

    // console.log(predicted_squad_timediff_values)
    return predicted_squad_timediff_values
}

export function calcActorRelativeTimeDist(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : number {
    let squad_timediff_values = getTimeDistValuesForSquad(game)

    return calcActorRelativeTimeDist_helper(actor, squad_timediff_values)
}

export function calcPredictedActorRelativeTimeDist(game: Bones.Engine.Game, actor: Bones.Entities.Actor, predicted_xy: Bones.Coordinate) : number {
    let squad_timediff_values = getPredictedTimeDistValuesForSquad(game, actor, predicted_xy)

    return calcActorRelativeTimeDist_helper(actor, squad_timediff_values)
}

function calcActorRelativeTimeDist_helper(actor: Bones.Entities.Actor, squad_timediff_values: ITimeDistForSquadMember[]) : number {
    let squad_timedist : number[] = []
    // get time dist associated with this actor
    let actor_td = squad_timediff_values.filter(td => { return td.id == actor.id })[0]
    // if (!(actor_td)) { debugger }

    for (let td of squad_timediff_values) {
        if (td.id == actor_td.id) { continue }

        squad_timedist.push(dist3d(actor_td.xy, actor_td.turns, td.xy, td.turns))
    }

    let avg_relative_squad_timedist = squad_timedist.reduce((a, b) => { return a + b}, 0) / squad_timedist.length
    return avg_relative_squad_timedist
}

// export function calcSquadTime(game: Bones.Engine.Game) : number {
//     let squad_timediff_values = getTimeDistValuesForSquad(game)
//     let avg_squad_timedist = calcSquadTime_helper(squad_timediff_values)
//     console.log(`avg 3d ${avg_squad_timedist}`)
//     for (let a of game.player_squad) {
//         let rtd = calcActorRelativeTimeDist(game, a)
//         console.log(`${a.name}: ${rtd}`)
//     }
//     return avg_squad_timedist
// }



// function calcSquadTime_helper(squad_timediff_values: ITimeDistForSquadMember[]) : number {

    
//     let squad_timedist : number[] = []
//     for (let a of squad_timediff_values) {
//         for (let b of squad_timediff_values) {
//             if (a.id == b.id) { continue }
//             squad_timedist.push(dist3d(a.xy, a.turns, b.xy, b.turns))
//         }
//     }
//     let avg_squad_timedist = squad_timedist.reduce((a, b) => { return a + b}) / squad_timedist.length
    
//     return avg_squad_timedist
// }


// export function calcSquadTime(game: Bones.Engine.Game) {

//     let squad_turns = game.player_squad.map(a => a.turn_count)
//     let avg_squad_turns = squad_turns.reduce((a, b) => { return a + b}) / squad_turns.length

//     let squad_dist : number[] = []
//     let squad_timedist : number[] = []
//     for (let a of game.player_squad) {
//         for (let b of game.player_squad) {
//             if (a.isSameAs(b)) { continue }
//             squad_dist.push(Bones.Utils.dist2d(a.location, b.location))
//             squad_timedist.push(dist3d(a.location, a.turn_count, b.location, b.turn_count))
//         }
//     }
//     let avg_squad_dist = squad_dist.reduce((a, b) => { return a + b}) / squad_dist.length
//     let avg_squad_timedist = squad_timedist.reduce((a, b) => { return a + b}) / squad_timedist.length
    
//     console.log(`avg turns: ${avg_squad_turns}| avg dist: ${avg_squad_dist}| avg 3d ${avg_squad_timedist}`)
// }



function dist3d(from_xy: Bones.Coordinate, from_turns: number, to_xy: Bones.Coordinate, to_turns: number) : number {
    let xdiff = (from_xy.x - to_xy.x)
    let ydiff = (from_xy.y - to_xy.y)
    let turn_diff = Math.floor((from_turns - to_turns) / 2)
    // let turn_diff = 0
    
    return Math.sqrt(xdiff*xdiff + ydiff*ydiff + turn_diff*turn_diff)
}


export function checkForAllowedSquadMemberEvent(game: Bones.Engine.Game, actor: Bones.Entities.Actor, event: GameEvent) : Bones.Enums.EventBlockedByTimeDistLockResponse {
    // console.log(`checking for allowed: ${actor.name}`)
    if ((event.actor.isPlayerControlled()) && (event.actor.actorType == Bones.Enums.ActorType.HERO) && (event.endsTurn)) {
        // console.log(`is player controlled : ${actor.name}`)
        let actor_relative_timedist = Bones.Actions.Squad.calcActorRelativeTimeDist(game, actor)
        if (actor_relative_timedist >= Bones.Config.RELATIVE_TIMEDIST_MAX) {
            // actor is currently outside of bounds for time-distance, but maybe this move makes it better
            if (event.event_type == Bones.Enums.EventType.MOVE) {

                let predicted_relative_timedist = calcPredictedActorRelativeTimeDist(game, actor, event.eventData.to_xy)
                // console.log(`actual: ${actor_relative_timedist} ${actor.location} vs predicted: ${predicted_relative_timedist} ${event.eventData.to_xy}`)
                if (predicted_relative_timedist < actor_relative_timedist) {
                    return Bones.Enums.EventBlockedByTimeDistLockResponse.NormallyBlockedButPermitted
                } else {
                    return Bones.Enums.EventBlockedByTimeDistLockResponse.Blocked
                }
            }
            
            // console.log(`${event.actor.name} is blocked from moving too far away`)
            return Bones.Enums.EventBlockedByTimeDistLockResponse.Blocked
        }
    }

    // not a player controlled thing
    return Bones.Enums.EventBlockedByTimeDistLockResponse.Allowed

}

export function getAverageSquadTurnCount(game: Bones.Engine.Game) : number {
    let squad_avg_turns = game.player_squad.map(a => { return a.turn_count}).reduce((a, b) => { return a + b}) / game.player_squad.length
    return squad_avg_turns
}

export function execFollow(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : boolean {
    let pactor = <Bones.Entities.PlayerActor>actor
    if (pactor.isLeader()) {
        // keep being leader?
        return false

    } else {
        for (let squaddie of game.player_squad) {
            if (squaddie.isSameAs(pactor)) { continue }
            execUnfollow(game, squaddie)
        }
        let abil_follow = pactor.getAbilityOfType(AbilityType.Follow)
        abil_follow.charges.resetToMax()
        let msg = `${pactor.name} is now leader`
        console.log(msg)
        game.messages.addMessage(msg)
        game.display.drawFooterPanel()
        game.display.drawPoint(pactor.location)

        pactor.pathmap = Bones.Engine.Pathmap.createGenericMapToPlayer(
            game,
            game.current_region,
            actor,
            Bones.Enums.LevelNavigationType.Walk,
            false
        )

        return true
    }
}

export function execUnfollow(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : boolean {
    let pactor = <Bones.Entities.PlayerActor>actor
    if (pactor.isLeader()) {
        let abil_follow = pactor.getAbilityOfType(AbilityType.Follow)
        abil_follow.charges.setCurrentLevel(0)
        let msg = `${pactor.name} is no longer leader`
        console.log(msg)
        game.messages.addMessage(msg)
        
        game.display.drawFooterPanel()
        game.display.drawPoint(pactor.location)
        
        pactor.pathmap = null

        return true
    } else {
        // already not being followed
        return false
    }
}

export function getSquadLeader(game: Bones.Engine.Game): Bones.Entities.Actor {
    for (let squaddie of game.player_squad) {
        if (squaddie.isLeader()) { return squaddie }
    }
    return null
}

export function getSquadFollowers(game: Bones.Engine.Game): Array<Bones.Entities.Actor> {
    return game.player_squad.filter((value, index, array) => { return (!(value.isLeader())) })
}

export function execFollowLeader(game: Bones.Engine.Game, follower: Bones.Entities.Actor, leader: Bones.Entities.Actor) : boolean {
    let leader_pathmap = leader.pathmap
    if (leader_pathmap == null) {
        console.log("no leader pathmap found")
        return false
    }
    
    let downhill_xy = leader_pathmap.getUnblockedDownhillNeighbor(follower, follower.location, game.current_region, false)
    if (!(downhill_xy)) {
        console.log("no valid downhill path found")
        return false
    }
    let mob_at = game.current_region.actors.getAt(downhill_xy)
    if ((mob_at) && (!(mob_at.isSameAs(follower)))) {
        console.log("downhill path blocked by mob")
        return false
    }
    
    game.addEventToQueue(new GameEvent(follower, Bones.Enums.EventType.MOVE, false, {
        from_xy: follower.location,
        to_xy: downhill_xy,
        following: true,
    }))
    return true
}

function canRally(game: Bones.Engine.Game, actor: Bones.Entities.Actor, ability: Bones.Actions.Abilities.Ability) : IRallyCheckResponse {
    // return true if we can rally from current location

    // 1 - all squad members can see each other
    let all_seen = true
    for (let from_squaddie of game.player_squad) {
        for (let to_squaddie of game.player_squad) {
            if (from_squaddie.isSameAs(to_squaddie)) { continue }

            let can_view = from_squaddie.hasKnowledgeOf(to_squaddie)
            if (!(can_view)) {
                all_seen = false
                break
            }
        }

        if (!(all_seen)) { break }
    }
    // console.log("all squad members can see each other?", all_seen)
    if (!(all_seen)) {
        return {
            can_rally: false,
            errMsg: "Can't Rally - Squad does not have LOS to each other"
        }
    }

    // 2- no bad guys
    let seen_baddies = false
    for (let squaddie of game.player_squad) {
        for (let known_entity of squaddie.knowledge.getAllEntities()) {
            if (squaddie.isSameAs(known_entity)) { continue }
            if (!(known_entity.isPlayerControlled())) {
                seen_baddies = true
                break
            }
        }
        if (seen_baddies) { break }
    }
    // console.log("any bad guys in sight of squad?", seen_baddies)
    if (seen_baddies) {
        return {
            can_rally: false,
            errMsg: "Can't Rally - Enemies in sight"
        }
    }

    return {
        can_rally: true,
        errMsg: "OK"
    }
}

interface IRallyCheckResponse {
    can_rally: boolean,
    errMsg: string
}

export function attemptRally(game: Bones.Engine.Game, actor: Bones.Entities.Actor, ability: Bones.Actions.Abilities.Ability) : Bones.Engine.Events.GameEvent {
    let can_rally = canRally(game, actor, ability)
    if (!(can_rally)) {
        // let msg = can_rally.errMsg
        // game.messages.addMessage(msg)
        return new GameEvent(actor, Bones.Enums.EventType.NONE, false, { errMsg: can_rally.errMsg })
    } else {
        return new GameEvent(actor, Bones.Enums.EventType.RALLY, true)
    }
}

export function execRally(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : boolean {
    // reset all squad members to same turn count
    let turn_count_list = game.player_squad.map((value, index, array) => { return value.turn_count })
    let max_turn_count = Math.max(...turn_count_list)

    for (let squaddie of game.player_squad) {
        squaddie.turn_count = max_turn_count
    }
    game.display.drawInfoPanel()
    let msg = `The squad rallies: turn counts reset`
    game.messages.addMessage(msg)
    return true
}
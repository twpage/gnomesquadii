import * as Bones from '../bones'
import { GameEvent } from '../game-engine/events'
import { TYPE_NEWLINE } from 'rot-js/lib/text'

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
    console.log(timedistvalues_lst)
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

    console.log(predicted_squad_timediff_values)
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

    let avg_relative_squad_timedist = squad_timedist.reduce((a, b) => { return a + b}) / squad_timedist.length
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
    // let turn_diff = Math.floor((from_turns - to_turns) / 2)
    let turn_diff = 0
    
    return Math.sqrt(xdiff*xdiff + ydiff*ydiff + turn_diff*turn_diff)
}

export function checkForAllowedSquadMemberEvent(game: Bones.Engine.Game, actor: Bones.Entities.Actor, event: GameEvent) : boolean {
    if ((event.actor.isPlayerControlled()) && (event.actor.actorType == Bones.Enums.ActorType.HERO) && (event.endsTurn)) {
        let actor_relative_timedist = Bones.Actions.Squad.calcActorRelativeTimeDist(game, actor)
        if (actor_relative_timedist >= Bones.Config.RELATIVE_TIMEDIST_MAX) {
            // actor is currently outside of bounds for time-distance, but maybe this move makes it better
            // TODO: PREDICT
            if (event.event_type == Bones.Enums.EventType.MOVE) {

                let predicted_relative_timedist = calcPredictedActorRelativeTimeDist(game, actor, event.eventData.to_xy)
                console.log(`actual: ${actor_relative_timedist} ${actor.location} vs predicted: ${predicted_relative_timedist} ${event.eventData.to_xy}`)
                return predicted_relative_timedist < actor_relative_timedist
            }
            
            console.log(`${event.actor.name} is blocked from moving too far away`)
            return false

        } else {

            return true
        }
    } else {
        // not a player controlled thing
        return false
    }
}
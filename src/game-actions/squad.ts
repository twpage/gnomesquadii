import * as Bones from '../bones'

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
    return timedistvalues_lst
}

export function calcActorRelativeTimeDist(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : number {
    let squad_timediff_values = getTimeDistValuesForSquad(game)

    let squad_timedist : number[] = []

    for (let td of squad_timediff_values) {
        if (td.id == actor.id) { continue }

        squad_timedist.push(dist3d(actor.location, actor.turn_count, td.xy, td.turns))
    }

    let avg_relative_squad_timedist = squad_timedist.reduce((a, b) => { return a + b}) / squad_timedist.length
    return avg_relative_squad_timedist
}

export function calcSquadTime(game: Bones.Engine.Game) : number {
    let squad_timediff_values = getTimeDistValuesForSquad(game)
    let avg_squad_timedist = calcSquadTime_helper(squad_timediff_values)
    console.log(`avg 3d ${avg_squad_timedist}`)
    for (let a of game.player_squad) {
        let rtd = calcActorRelativeTimeDist(game, a)
        console.log(`${a.name}: ${rtd}`)
    }
    return avg_squad_timedist
}

export function predictSquadTime(game: Bones.Engine.Game, actor: Bones.Entities.Actor, predicted_xy: Bones.Coordinate) {
    let squad_timediff_values = getTimeDistValuesForSquad(game)
    let predicted_squad_timediff_values :ITimeDistForSquadMember[] = []
    
    for (let td of squad_timediff_values) {
        if (td.id == actor.id) {
            let new_td = td
            new_td.xy = predicted_xy
            new_td.turns += 1
            predicted_squad_timediff_values.push(td)
        } else {
            predicted_squad_timediff_values.push(td)
        }
    }

    return predicted_squad_timediff_values
}

function calcSquadTime_helper(squad_timediff_values: ITimeDistForSquadMember[]) : number {

    
    let squad_timedist : number[] = []
    for (let a of squad_timediff_values) {
        for (let b of squad_timediff_values) {
            if (a.id == b.id) { continue }
            squad_timedist.push(dist3d(a.xy, a.turns, b.xy, b.turns))
        }
    }
    let avg_squad_timedist = squad_timedist.reduce((a, b) => { return a + b}) / squad_timedist.length
    
    return avg_squad_timedist
}


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
    
    return Math.sqrt(xdiff*xdiff + ydiff*ydiff + turn_diff*turn_diff)
}
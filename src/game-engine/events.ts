import * as ROT from 'rot-js'
import * as Bones from '../bones'
import { InputResponse } from './input-handlers'
import { EventType, TargetingType } from '../game-enums/enums'

export interface IEventData {
    direction_xy?: Bones.Coordinate
    target?: Bones.Entities.Actor
    from_xy?: Bones.Coordinate
    to_xy?: Bones.Coordinate
    errMsg?: string
    targetingType?: TargetingType
}

export class GameEvent {
    constructor(
        public actor: Bones.Entities.Actor,
        public event_type : Bones.Enums.EventType, 
        public endsTurn: boolean,
        public eventData : IEventData = {}
        ) {
    }
}


export async function processEvents(game: Bones.Engine.Game): Promise<boolean>{
    let next_event = game.event_queue.shift()
    return await processEvent(game, next_event)
}


async function processEvent(game: Bones.Engine.Game, event: GameEvent) : Promise<boolean>  {
    let actor = event.actor
    let event_type = event.event_type
    console.log(`running event ${Bones.Enums.EventType[event_type]} for ${actor.name} on turn #${actor.turn_count} (Ends Turn: ${event.endsTurn})`)

    // see if we can run this
    
    if ((event.actor.isPlayerControlled()) && (event.actor.actorType == Bones.Enums.ActorType.HERO) && (event.endsTurn)) {
        let actor_relative_timedist = Bones.Actions.Squad.calcActorRelativeTimeDist(game, actor)
        if (actor_relative_timedist >= Bones.Config.RELATIVE_TIMEDIST_MAX) {
            console.log(`${event.actor.name} is blocked from moving too far away`)
            game.addEventToQueue(new GameEvent(event.actor, EventType.NONE, false))
            return Promise.resolve(true)
        }
    }

    switch (event_type) {
        case EventType.WAIT:
            // if (actor.isPlayerControlled()) {
            //     console.log("you wait")
            // }
            break

        case EventType.MOVE:
            Bones.Actions.Movement.execMove(game, actor, event.eventData.from_xy, event.eventData.to_xy)
            break
        
        case EventType.CYCLE_SQUAD:
            let new_index = ROT.Util.mod(game.active_squad_index + 1, game.player_squad.length)
            game.active_squad_index = new_index
            game.display.drawAll()
            break

        case EventType.TARGETING_START:
            let start_xy = event.actor.location
            let end_xy = start_xy.add(event.eventData.to_xy)
            Bones.Actions.Targeting.execTargetingStart(game, event.actor, event.eventData.targetingType, start_xy, end_xy)
            break

        case EventType.TARGETING_MOVE:
            let new_target_xy = game.tgt_interface.target_xy.add(event.eventData.direction_xy)
            // console.log(game.tgt_interface.target_xy, event.eventData.direction_xy)
            Bones.Actions.Targeting.execTargetingMove(game, event.actor, new_target_xy)
            break
    
        case EventType.TARGETING_END:
            Bones.Actions.Targeting.execTargetingEnd(game, event.actor)
            break

        case EventType.ATTACK:
            let target = event.eventData.target
            Bones.Actions.Combat.execAttack(game, actor, event.eventData.from_xy, event.eventData.to_xy, target)
            break

        case EventType.GAMETICK:
            Bones.Actions.AI.execGameTick(game, actor)
            break

        case EventType.MENU:
            console.log("player does something that doesn't take a turn")
            break

        case EventType.FANCY:
            console.log("This event pauses the game")
            await runFancyAnimation()
            break

        case EventType.FANCY:
            console.log("This event pauses the game")
            await runFancyAnimation()
            break
        
        case EventType.EXTRA_FANCY:
            console.log("This event generates other events")
            game.addEventToQueue(new GameEvent(actor, Bones.Enums.EventType.FANCY, false))
            game.addEventToQueue(new GameEvent(game.architect, Bones.Enums.EventType.FANCY, false))
            break

        case EventType.NONE:
            if (event.eventData.errMsg) {
                console.log(event.eventData.errMsg)
            }
            break

        default:
            console.log("unknown event type")
    }


    if (event.endsTurn) {
        actor.turn_count += 1

        if (
            (actor.isPlayerControlled()) &&
            (!(actor.isSameAs(game.player)))
        ) {
            // console.log('got ending turn for player-cintroller actor')
            game.addEventToQueue(new GameEvent(game.player, EventType.NONE, true))
        }
    
        return Promise.resolve(true)
    } else {
        return Promise.resolve(false)
    }

}

function runFancyAnimation(words: string = "*") : Promise<boolean> {
    // return new Promise(resolve => setTimeout(resolve, 3000))
    // let fancy_fn = (num_seconds : number) => new Promise(resolve => setTimeout(resolve, num_seconds))
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

    for (let i = 0; i <= 3; i++) {
        wait(i * 500).then(() => {
            console.log(`waited ${i} times ${words}`)
        })
    }
    return wait(3 * 500).then(() => {
        return true
    })
}

export function convertPlayerInputToEvent(game: Bones.Engine.Game, actor: Bones.Entities.Actor, ir: InputResponse) : GameEvent {
    let intended_event : GameEvent
    let region = game.current_region
    let active_actor = game.getActiveSquadMember()

    switch (ir.event_type) {
        case EventType.WAIT:
            intended_event = new GameEvent(active_actor, ir.event_type, true)
            break

        case EventType.ATTEMPT_MOVE:
            let dir_xy = ir.eventData.direction_xy
            intended_event = Bones.Actions.Movement.getEventFromAttemptedMove(game, active_actor, dir_xy)

            break
        
        case EventType.EXAMINE_START:
            let target_xy = new Bones.Coordinate(0, 0)
            intended_event = new GameEvent(active_actor, EventType.TARGETING_START, false, {to_xy: target_xy, targetingType: TargetingType.Examine})
            break

        case EventType.TARGETING_MOVE:
            intended_event = new GameEvent(active_actor, ir.event_type, false, ir.eventData)
            break

        // stack up these "pass through" events
        case EventType.CYCLE_SQUAD:
        case EventType.MENU:
        case EventType.FANCY:
        case EventType.EXTRA_FANCY:
        case EventType.TARGETING_END:
            intended_event = new GameEvent(active_actor, ir.event_type, false)
            break
        
        default:
            intended_event = new GameEvent(active_actor, EventType.NONE, false)
    }

    return intended_event
}
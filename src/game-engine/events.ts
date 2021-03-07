import * as Bones from '../bones'
import { InputResponse } from './input-handlers'
import { ActorType, EventType } from '../game-enums/enums'

export interface IEventData {
    direction_xy?: Bones.Coordinate
    target?: Bones.Entities.Actor
    from_xy?: Bones.Coordinate
    to_xy?: Bones.Coordinate
    errMsg?: string
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
    console.log(`running event ${Bones.Enums.EventType[event_type]} for ${actor.name} on turn #${actor.turn_count}`)

    switch (event_type) {
        case EventType.WAIT:
            if (actor.isPlayerControlled()) {
                console.log("you wait")
            }
            break

        case EventType.MOVE:
            Bones.Actions.Movement.execMove(game, actor, event.eventData.from_xy, event.eventData.to_xy)
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

    switch (ir.event_type) {
        case EventType.WAIT:
            intended_event = new GameEvent(actor, ir.event_type, true)
            break
        case EventType.ATTEMPT_MOVE:
            let dir_xy = ir.eventData.direction_xy
            let new_xy = actor.location.add(dir_xy)
            
            // first see if it is a valid coordinate
            let is_valid_coord = region.isValid(new_xy)
            if (is_valid_coord) {

                // is there a monster there?
                let mob_at = region.actors.getAt(new_xy)
                if (mob_at) {
                    intended_event = new GameEvent(actor, EventType.ATTACK, true, {
                        target: mob_at,
                        from_xy: actor.location.clone(),
                        to_xy: new_xy
                    })
                } else {
                    // no monster there, just attempt regular movement
                    let is_valid = Bones.Actions.Movement.isValidMove(game, actor, new_xy)
                    if (is_valid) {
                        let eventData: IEventData = {
                            from_xy: actor.location.clone(),
                            to_xy: new_xy
                        }
                        intended_event = new GameEvent(actor, EventType.MOVE, true, eventData)
                    } else {
                        intended_event = new GameEvent(actor, EventType.NONE, false, {errMsg: "You can't move there"})
                    }
                }

            } else {
                intended_event = new GameEvent(actor, EventType.NONE, false, {errMsg: "There's nothing there"})
            }

            break
        
        // stack up these "pass through" events
        case EventType.MENU:
        case EventType.FANCY:
        case EventType.EXTRA_FANCY:
            intended_event = new GameEvent(actor, ir.event_type, false)
            break
        
        default:
            intended_event = new GameEvent(actor, EventType.NONE, false)
    }

    return intended_event
}
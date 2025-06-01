import * as ROT from 'rot-js'
import * as Bones from '../bones'
import { InputResponse } from './input-handlers'
import { AbilityType, EventType, TargetingType } from '../game-enums/enums'
import { Ability } from '../game-actions/abilities'
import { Actor } from '../game-entities'

export interface IEventData {
    direction_xy?: Bones.Coordinate
    target?: Bones.Entities.Actor
    from_xy?: Bones.Coordinate
    to_xy?: Bones.Coordinate
    errMsg?: string
    targetingType?: TargetingType
    targetingAbility?: Ability
    index?: number
    following? : boolean
    // menu?: IMenuInfo
}

// export interface IMenuInfo {
//     menuAbilityType : AbilityType
//     index: number
//     cycle_direction: number
// }

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
    let check_event_blocked = Bones.Actions.Squad.checkForAllowedSquadMemberEvent(game, actor, event)
    if (check_event_blocked == Bones.Enums.EventBlockedByTimeDistLockResponse.Blocked) {
        game.addEventToQueue(new GameEvent(event.actor, EventType.NONE, false, {errMsg: "Actor is out of sync"}))
        return Promise.resolve(true)

    } else if (check_event_blocked == Bones.Enums.EventBlockedByTimeDistLockResponse.NormallyBlockedButPermitted) {
        if (!(actor.stamina.isEmpty())) {
            actor.stamina.decrement(1)
            game.display.drawInfoPanel()
        }
    }
    
    // if ((event.actor.isPlayerControlled()) && (event.actor.actorType == Bones.Enums.ActorType.HERO) && (event.endsTurn)) {
    //     let actor_relative_timedist = Bones.Actions.Squad.calcActorRelativeTimeDist(game, actor)
    //     if (actor_relative_timedist >= Bones.Config.RELATIVE_TIMEDIST_MAX) {
    //         console.log(`${event.actor.name} is blocked from moving too far away`)
    //         game.addEventToQueue(new GameEvent(event.actor, EventType.NONE, false))
    //         return Promise.resolve(true)
    //     }
    // }

    switch (event_type) {
        case EventType.RALLY:
            Bones.Actions.Squad.execRally(game, actor)
            break

        case EventType.FOLLOW_START:
            Bones.Actions.Squad.execFollow(game, actor)
            break
        
        case EventType.FOLLOW_STOP:
            Bones.Actions.Squad.execUnfollow(game, actor)
            break

        case EventType.FOLLOW_LEADER:
            let leader = event.eventData.target
            Bones.Actions.Squad.execFollowLeader(game, actor, leader)
            break

        case EventType.WAIT:
            // if (actor.isPlayerControlled()) {
            //     console.log("you wait")
            // }
            Bones.Actions.Movement.execWait(game, actor)
            break
        
        // case EventType.MENU_START:
        //     Bones.
        case EventType.SWAP:
            Bones.Actions.Movement.execSwap(game, actor, event.eventData.from_xy, event.eventData.to_xy, event.eventData.target)
            break
        case EventType.MOVE:
            let is_following : boolean
            if (event.eventData.following) {
                is_following = true
            } else {
                is_following = false
            }
            Bones.Actions.Movement.execMove(game, actor, event.eventData.from_xy, event.eventData.to_xy, is_following)
            break
        
        case EventType.CYCLE_SQUAD:
            let new_index = ROT.Util.mod(game.active_squad_index + 1, game.player_squad.length)
            game.active_squad_index = new_index
            game.display.drawAll()
            break

        case EventType.TARGETING_START:
            let start_xy = event.actor.location
            let end_xy = start_xy.add(event.eventData.to_xy)
            Bones.Actions.Targeting.execTargetingStart(game, event.actor, start_xy, end_xy, event.eventData.targetingType, event.eventData.targetingAbility)
            break

        case EventType.TARGETING_MOVE:
            let new_target_xy = game.tgt_interface.target_xy.add(event.eventData.direction_xy)
            // console.log(game.tgt_interface.target_xy, event.eventData.direction_xy)
            Bones.Actions.Targeting.execTargetingMove(game, event.actor, new_target_xy)
            break

        case EventType.TARGETING_CANCEL:
            Bones.Actions.Targeting.execTargetingCancel(game, event.actor, event)
            Bones.Actions.Menu.stopMenu(game, event)
            break
    
        case EventType.TARGETING_END:
            Bones.Actions.Targeting.execTargetingEnd(game, event.actor, event)
            Bones.Actions.Menu.stopMenu(game, event)
            break

        case EventType.ATTACK:
            let target = event.eventData.target
            Bones.Actions.Combat.execAttack(game, actor, event.eventData.from_xy, event.eventData.to_xy, target)
            break

        case EventType.CRIT_SHOT:
            let crit_target = event.eventData.target
            Bones.Actions.Combat.execCriticalShot(game, actor, event.eventData.from_xy, event.eventData.to_xy, crit_target)
            break
    
        case EventType.GAMETICK:
            Bones.Actions.AI.execGameTick(game, actor)
            break

        // case EventType.MENU:
        //     console.log("player does something that doesn't take a turn")
        //     break

        case EventType.MENU_START:
            Bones.Actions.Menu.startMenu(game, event)
            break

        case EventType.MENU_SELECT:
            Bones.Actions.Menu.selectMenu(game, event)
            break

        case EventType.MENU_CYCLE:
            Bones.Actions.Menu.cycleMenu(game, event)
            break

        case EventType.MENU_STOP:
            Bones.Actions.Menu.stopMenu(game, event)
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
                let msg = event.eventData.errMsg
                console.log(msg)
                game.messages.addMessage(msg)
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
        
        case EventType.HOTKEY:
            let hotkey_index = ir.eventData.index
            // let active_abils = game.getHotKeyActions()
            let active_abils = game.base_menu_abilities

            if (hotkey_index < active_abils.length) {
                // let ability = game.getHotKeyActions()[hotkey_index]
                let ability = game.base_menu_abilities[hotkey_index]
                intended_event = Bones.Actions.Abilities.execAbilityActivated(game, active_actor, ability)
            } else {
                intended_event = new GameEvent(active_actor, EventType.NONE, false, { errMsg: "Invalid hotkey"})
            }
            break

        case EventType.EXAMINE_START:
            let target_xy = new Bones.Coordinate(0, 0)
            intended_event = new GameEvent(active_actor, EventType.TARGETING_START, false, {
                to_xy: target_xy,
                targetingType: TargetingType.Examine,
                targetingAbility: new Bones.Actions.Abilities.Examine()
            })
            break

        case EventType.TARGETING_MOVE:
            intended_event = new GameEvent(active_actor, ir.event_type, false, ir.eventData)
            break

        // stack up these "pass through" events
        case EventType.SWAP:
        case EventType.RALLY:
        case EventType.FOLLOW_START:
        case EventType.FOLLOW_STOP:
        case EventType.FOLLOW_LEADER:
        case EventType.CYCLE_SQUAD:
        case EventType.MENU_SELECT:
        case EventType.MENU_CYCLE:
        case EventType.MENU_STOP:
        case EventType.FANCY:
        case EventType.EXTRA_FANCY:
        case EventType.TARGETING_END:
        case EventType.TARGETING_CANCEL:
            intended_event = new GameEvent(active_actor, ir.event_type, false, ir.eventData)
            break
        
        default:
            intended_event = new GameEvent(active_actor, EventType.NONE, false, ir.eventData)
    }

    return intended_event
}
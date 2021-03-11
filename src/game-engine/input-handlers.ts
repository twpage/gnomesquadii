import * as  ROT from 'rot-js/lib/index'
import * as Bones from '../bones'
import { Directions } from '../game-components'
import { EventType, InputHandlerType } from '../game-enums/enums'
import { IEventData, GameEvent } from './events'


export interface InputResponse {
    validInput: boolean
    actualEvent?: GameEvent
    event_type?: EventType
    eventData?: IEventData
}
const KEYS_LEFT = [ROT.KEYS.VK_A, ROT.KEYS.VK_LEFT]
const KEYS_RIGHT = [ROT.KEYS.VK_D, ROT.KEYS.VK_RIGHT]
const KEYS_UP = [ROT.KEYS.VK_W, ROT.KEYS.VK_UP]
const KEYS_DOWN = [ROT.KEYS.VK_S, ROT.KEYS.VK_DOWN]
const KEYS_CYCLE = [ROT.KEYS.VK_E]
const KEYS_EXAMIME = [ROT.KEYS.VK_X]

let activeInputHandlerType : InputHandlerType = InputHandlerType.Core
export function setActiveInputHandler(handler_type: InputHandlerType) {
    activeInputHandlerType = handler_type
}

export function handleInput(event: KeyboardEvent) : InputResponse {
    switch (activeInputHandlerType) {
        case InputHandlerType.Targeting:
            return handleInput_Targeting(event)

        default:
            return handleInput_Core(event)
    }
}

export function handleInput_Core(event: KeyboardEvent) : InputResponse {
    let code = event.keyCode

    if (code == ROT.KEYS.VK_SPACE) {
        return {validInput: true, event_type: EventType.WAIT}
    } else if (code == ROT.KEYS.VK_F) {
        return {validInput: true, event_type: EventType.FANCY}
    } else if (code == ROT.KEYS.VK_G) {
        return {validInput: true, event_type: EventType.EXTRA_FANCY}
    } else if (code == ROT.KEYS.VK_Q) {
        return {validInput: true, event_type: EventType.MENU }
    } else if (KEYS_LEFT.indexOf(code) > -1) {
        return {
            validInput: true, 
            event_type: EventType.ATTEMPT_MOVE, 
            eventData: {
                direction_xy: Directions.LEFT
            }
        }
    } else if (KEYS_RIGHT.indexOf(code) > -1) {
        return {
            validInput: true, 
            event_type: EventType.ATTEMPT_MOVE, 
            eventData: {
                direction_xy: Directions.RIGHT
            }
        }
    } else if (KEYS_UP.indexOf(code) > -1) {
        return {
            validInput: true, 
            event_type: EventType.ATTEMPT_MOVE, 
            eventData: {
                direction_xy: Directions.UP
            }
        }
    } else if (KEYS_DOWN.indexOf(code) > -1) {
        return {
            validInput: true, 
            event_type: EventType.ATTEMPT_MOVE, 
            eventData: {
                direction_xy: Directions.DOWN
            }
        }
    } else if (KEYS_CYCLE.indexOf(code) > -1) {
        return {
            validInput: true, 
            event_type: EventType.CYCLE_SQUAD, 
        }
    } else if (KEYS_EXAMIME.indexOf(code) > -1) {
        return {
            validInput: true, 
            event_type: EventType.EXAMINE_START, 
        }
    }

    return {validInput: false, event_type: EventType.NONE}
}

export function handleInput_Targeting(event: KeyboardEvent) : InputResponse {
    let code = event.keyCode
    if (KEYS_LEFT.indexOf(code) > -1) {
        return {
            validInput: true, 
            event_type: EventType.TARGETING_MOVE, 
            eventData: {
                direction_xy: Directions.LEFT
            }
        }
    } else if (KEYS_RIGHT.indexOf(code) > -1) {
        return {
            validInput: true, 
            event_type: EventType.TARGETING_MOVE, 
            eventData: {
                direction_xy: Directions.RIGHT
            }
        }
    } else if (KEYS_UP.indexOf(code) > -1) {
        return {
            validInput: true, 
            event_type: EventType.TARGETING_MOVE, 
            eventData: {
                direction_xy: Directions.UP
            }
        }
    } else if (KEYS_DOWN.indexOf(code) > -1) {
        return {
            validInput: true, 
            event_type: EventType.TARGETING_MOVE, 
            eventData: {
                direction_xy: Directions.DOWN
            }
        }
    } else if (code == ROT.KEYS.VK_ESCAPE) {
        return {
            validInput: true, 
            event_type: EventType.TARGETING_END, 
        }
    }

    return {validInput: false, event_type: EventType.NONE}
}
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
const KEYS_HOTKEYS = [ROT.KEYS.VK_1, ROT.KEYS.VK_2, ROT.KEYS.VK_3, ROT.KEYS.VK_4]
//ACTION	WAIT	CYCLE	MENU
//X	A	B	Y
const KEYS_MENU_CONFIRM = [ROT.KEYS.VK_1]
const KEYS_MENU_CANCEL = [ROT.KEYS.VK_2]
const KEYS_MENU_NEXT = [ROT.KEYS.VK_3]
const KEYS_MENU_PREV = [ROT.KEYS.VK_4]

let activeInputHandlerType : InputHandlerType = InputHandlerType.Core
export function setActiveInputHandler(handler_type: InputHandlerType) {
    activeInputHandlerType = handler_type
}

export function getActiveInputHandler() : InputHandlerType {
    return activeInputHandlerType
}

export function handleInput(event: KeyboardEvent) : InputResponse {
    switch (activeInputHandlerType) {
        case InputHandlerType.Targeting:
            return handleInput_Targeting(event)

        case InputHandlerType.Menu:
            return handleInput_Menu(event)
    
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
    // } else if (code == ROT.KEYS.VK_Q) {
    //     return {validInput: true, event_type: EventType.MENU }
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
    } else if (KEYS_HOTKEYS.indexOf(code) > -1) {
        let hotkey_index = KEYS_HOTKEYS.indexOf(code)
        return {
            validInput: true, 
            event_type: EventType.HOTKEY, 
            eventData: {
                index: hotkey_index
            }
        }
    }

    return {validInput: false, event_type: EventType.NONE}
}
export function handleInput_Menu(event: KeyboardEvent): InputResponse {
    let code = event.keyCode
    if (KEYS_LEFT.concat(KEYS_UP, KEYS_MENU_PREV).indexOf(code) > -1) {
        return {
            validInput: true,
            event_type: EventType.MENU_CYCLE,
            eventData: {
                direction_xy: Directions.LEFT
            }
        }
    } else if (KEYS_RIGHT.concat(KEYS_DOWN, KEYS_MENU_NEXT).indexOf(code) > -1) {
        return {
            validInput: true,
            event_type: EventType.MENU_CYCLE,
            eventData: {
                direction_xy: Directions.RIGHT
            }
        }
    } else if (KEYS_MENU_CONFIRM.concat([ROT.KEYS.VK_SPACE]).indexOf(code) > -1) {

        return {
            validInput: true,
            event_type: EventType.MENU_SELECT,
        }
    } else if (KEYS_CYCLE.concat(KEYS_MENU_CANCEL, [ROT.KEYS.VK_ESCAPE]).indexOf(code) > -1) {
        return {
            validInput: true,
            event_type: EventType.MENU_STOP,
        }
    }



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
    // } else if (code == ROT.KEYS.VK_ESCAPE) {
    } else if (KEYS_MENU_CANCEL.concat([ROT.KEYS.VK_ESCAPE]).indexOf(code) > -1) {
        return {
            validInput: true, 
            event_type: EventType.TARGETING_CANCEL, 
        }
    // } else if (code == ROT.KEYS.VK_SPACE) {
    } else if (KEYS_MENU_CONFIRM.concat([ROT.KEYS.VK_SPACE]).indexOf(code) > -1) {
        return {
            validInput: true, 
            event_type: EventType.TARGETING_END, 
        }
    }

    return {validInput: false, event_type: EventType.NONE}
}
import * as  ROT from 'rot-js/lib/index'
import * as Bones from '../bones'
import { InputUtility } from '../game-engine'
import { GameEvent } from '../game-engine/events'

export function startMenu(game: Bones.Engine.Game, event: Bones.Engine.Events.GameEvent) {
    game.menu_index = 0
    game.display.drawFooterPanel()
    // game.messages.addMessage("[1] Confirm [2] Cancel [3] Next [4] Prev")
    Bones.Engine.setActiveInputHandler(Bones.Enums.InputHandlerType.Menu)
}

export function selectMenu(game: Bones.Engine.Game, event: Bones.Engine.Events.GameEvent) {
    // no current menu, nothing to do here??
    if (game.menu_index == null) {
        game.addEventToQueue(new GameEvent(event.actor, Bones.Enums.EventType.NONE, false))
        // game.current_menu_abilities = game.base_menu_abilities
        // game.menu_index = 0
        // game.display.drawFooterPanel()
        // Bones.Engine.setActiveInputHandler(Bones.Enums.InputHandlerType.Menu)
        

    // currently in a menu, execute the current highlighted item
    } else {
        let selected_ability = game.current_menu_abilities[game.menu_index]
        let intended_event = Bones.Actions.Abilities.execAbilityActivated(game, event.actor, selected_ability)
        // return intended_event
        game.addEventToQueue(intended_event)
    }
}

export function stopMenu(game: Bones.Engine.Game, event: Bones.Engine.Events.GameEvent) {
    game.current_menu_abilities = []
    game.menu_index = null
    game.display.drawFooterPanel()
    Bones.Engine.setActiveInputHandler(Bones.Enums.InputHandlerType.Core)
}

export function cycleMenu(game: Bones.Engine.Game, event: Bones.Engine.Events.GameEvent) {
    let cycle_direction = 0
    if (event.eventData.direction_xy.compare(Bones.Directions.LEFT)) {
        cycle_direction = -1
    } else {
        cycle_direction = 1
    }
    game.menu_index = ROT.Util.mod(game.menu_index + cycle_direction, game.current_menu_abilities.length)
    game.display.drawFooterPanel()
}
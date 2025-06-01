import * as Bones from '../bones'
import { GameEvent } from '../game-engine/events'
import { AbilityType, EventType } from '../game-enums/enums'

export class Ability {
    charges : Bones.Stat
    constructor(public abil_type: Bones.Enums.AbilityType) {
        this.charges = new Bones.Stat(Bones.Enums.StatName.Charges, 1)
    }
    canUse() : boolean {
        return (!(this.charges.isEmpty()))
    }
    getName() : string {
        return AbilityType[this.abil_type]
    }
}

export class Examine extends Ability {
    constructor() {
        super(Bones.Enums.AbilityType.Examine)
    }

}

export class ButtonMenuAction extends Ability {
    constructor() { super(Bones.Enums.AbilityType.ActionMenu) }
    getName() : string { return "Action" }
}

export class ButtonMenuSquad extends Ability {
    constructor() { super(Bones.Enums.AbilityType.SquadMenu) }
    getName() : string { return "Squad" }
}

export class ButtonMenuInventory extends Ability {
    constructor() { super(Bones.Enums.AbilityType.InventoryMenu) }
    getName() : string { return "Inv" }
}

export class ButtonMenuGame extends Ability {
    constructor() { super(Bones.Enums.AbilityType.GameMenu) }
    getName() : string { return "Menu" }
}

export class Rest extends Ability {
    constructor() {
        super(Bones.Enums.AbilityType.Rest)
    }
    getName() : string {
        return "Wait"
    }
}

export class Cycle extends Ability {
    constructor() {
        super(Bones.Enums.AbilityType.Cycle)
    }
    getName() : string {
        return "Next"
    }
}

export class Shoot extends Ability {
    constructor() {
        super(Bones.Enums.AbilityType.Shoot)
    }
    getName() : string {
        return (this.charges.isEmpty()) ? "Empty" : "Shoot"
    }
}

export class Bullseye extends Ability {
    constructor() {
        super(Bones.Enums.AbilityType.Bullseye)
    }
    getName() : string {
        return (this.charges.isEmpty()) ? "Empty" : "Bullseye"
    }
}

export class Rally extends Ability {
    constructor() {
        super(Bones.Enums.AbilityType.Rally)
    }
    getName() : string {
        return "Rally"
    }
}

export class Follow extends Ability {
    constructor() {
        super(Bones.Enums.AbilityType.Follow)
    }
    getName() : string {
        return (this.charges.isEmpty()) ? "Follow" : "Unfollow"
    }
}

// export class Unfollow extends Ability {
//     constructor() {
//         super(Bones.Enums.AbilityType.Unfollow)
//     }
//     getName() : string {
//         return "Unfollow"
//     }
// }

// export interface IActiveAbilities { [hotkey: number] : Bones.Actions.Abilities.Ability }


export function getActiveAbilitiesFor(game: Bones.Engine.Game, actor: Bones.Entities.Actor) : Array<Ability> {
    let abilities = actor.abilities
    let max_keys = 4
    let active_abils : Array<Ability> = []
    
    for (let i = 0; i < Math.min(max_keys, abilities.length); i++) {
        let ability = abilities[i]
        // active_abils[i] = ability
        active_abils.push(ability)
    }

    // TODO: conver this to somewhere in abilities to return active hotkeys for person 
    // include close door ?

    return active_abils
}

export function execAbilityActivated(game: Bones.Engine.Game, actor: Bones.Entities.Actor, ability: Bones.Actions.Abilities.Ability) : GameEvent {
    switch (ability.abil_type) {
        case AbilityType.Rest:
            return new GameEvent(actor, EventType.WAIT, true)
            break

        case AbilityType.Cycle:
            return new GameEvent(actor, EventType.CYCLE_SQUAD, false)
            break
    
        case AbilityType.ActionMenu:
            let squaddie = game.getActiveSquadMember()
            let squaddie_abilities = Bones.Actions.Abilities.getActiveAbilitiesFor(this, squaddie)
            game.current_menu_abilities = squaddie_abilities//.concat([new Bones.Actions.Abilities.Rally()])
            
            return new GameEvent(actor, Bones.Enums.EventType.MENU_START, false)
            break

        // case AbilityType.SquadMenu:
        //     game.current_menu_abilities = [
        //         new Bones.Actions.Abilities.Rally(),
        //         new Bones.Actions.Abilities.Follow(),
        //         new Bones.Actions.Abilities.Unfollow(),
        //     ]
        //     game.menu_index = 0
        //     game.display.drawFooterPanel()
        //     break

        case AbilityType.Shoot:

            if (ability.charges.isEmpty()) {
                console.log("Reloading!")
                
                ability.charges.increment(1)
                // game.display.drawFooterPanel()
                game.messages.addMessage(`${actor.name} reloads their bow`)
                game.display.drawPoint(actor.location)
                game.addEventToQueue(new GameEvent(actor, EventType.MENU_STOP, false))
                return new GameEvent(actor, EventType.NONE, true)

            } else {
                if (actor.stamina.isEmpty()) {
                    return new GameEvent(actor, EventType.NONE, false, { errMsg: "Not enough stamina"})
                }
    
                actor.stamina.decrement(1)
                game.display.drawInfoPanel()
    
                let target_xy = Bones.Actions.Targeting.guessStartingTarget(game, actor)
                return new GameEvent(actor, EventType.TARGETING_START, false, {
                    targetingType: Bones.Enums.TargetingType.Shoot,
                    targetingAbility: ability,
                    to_xy: target_xy 
                })
            }
            break

        case AbilityType.Bullseye:


            if (ability.charges.isEmpty()) {
                console.log("Reloading!")
                game.messages.addMessage(`${actor.name} readies their bow`)
                ability.charges.increment(1)
                game.display.drawFooterPanel()
                game.display.drawPoint(actor.location)
                game.addEventToQueue(new GameEvent(actor, EventType.MENU_STOP, false))
                return new GameEvent(actor, EventType.NONE, true)

            } else {

                if (actor.stamina.isEmpty()) {
                    return new GameEvent(actor, EventType.NONE, false, { errMsg: "Not enough stamina"})
                }
    
                actor.stamina.setCurrentLevel(0)
                game.display.drawInfoPanel()

                // let target_xy = new Bones.Coordinate(0, 0)
                let target_xy = Bones.Actions.Targeting.guessStartingTarget(game, actor)
                return new GameEvent(actor, EventType.TARGETING_START, false, {
                    targetingType: Bones.Enums.TargetingType.Bullseye,
                    targetingAbility: ability,
                    to_xy: target_xy 
                })
            }
            break
    
        case AbilityType.Dash:
            console.log("whee") 
            break

        case AbilityType.Rally:
            let rally_event = Bones.Actions.Squad.attemptRally(game, actor, ability)
            game.addEventToQueue(new GameEvent(actor, EventType.MENU_STOP, false))
            return rally_event
            break

        case AbilityType.Follow:
            game.addEventToQueue(new GameEvent(actor, EventType.MENU_STOP, false))
            if (ability.charges.isEmpty()) {
                // turn follow on
                return new GameEvent(actor, EventType.FOLLOW_START, false)
            } else {
                // turn follow off
                return new GameEvent(actor, EventType.FOLLOW_STOP, false)
            }
            break
    }

    return new GameEvent(actor, EventType.NONE, false, {errMsg: "unsupported ability"})

}


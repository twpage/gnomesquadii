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

export class Rifle extends Ability {
    constructor() {
        super(Bones.Enums.AbilityType.Rifle)
    }
    getName() : string {
        return (this.charges.isEmpty()) ? "Reload" : "Rifle"
    }
}
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
        case AbilityType.Rifle:
            let target_xy = new Bones.Coordinate(0, 0)
            return new GameEvent(actor, EventType.TARGETING_START, false, { targetingType: Bones.Enums.TargetingType.Shoot, to_xy: target_xy })

        case AbilityType.Dash:
            console.log("whee") 
            break

        case AbilityType.Camp:
            console.log("zzzzzzzzzz") 
            break
    }

    return new GameEvent(actor, EventType.WAIT, false)

}


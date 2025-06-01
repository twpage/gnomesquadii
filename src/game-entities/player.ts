import * as Bones from '../bones'
import { Ability } from '../game-actions/abilities'
import { AbilityType } from '../game-enums/enums'
import { Actor } from './actor'

export class PlayerActor extends Actor {
    // constructor (actor_def : IActorDefinition) {
    //     super(actor_def)
    // }
    act (game: Bones.Engine.Game) : Promise<Bones.Engine.InputResponse> {
        // this.turn_count += 1
        console.log(`waiting on player input for turn #${this.turn_count}`)
        
        return Bones.Engine.InputUtility.waitForInput(Bones.Engine.handleInput.bind(this))
    }

    isPlayerControlled(): boolean {
        return true
    }

    isLeader(): boolean {
        // find 'follow' ability
        let abil_follow = this.getAbilityOfType(AbilityType.Follow)//this.abilities.filter((value, index, array) => { return value.abil_type == AbilityType.Follow })[0]
        if (abil_follow.charges.isEmpty()) {
            return false
        } else {
            return true
        }
    }

}

import * as Bones from '../bones'
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

}

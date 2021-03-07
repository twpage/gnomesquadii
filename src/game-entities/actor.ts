import * as Bones from '../bones'
import { GridOfEntities } from '../game-components/grid'
import { ActorType } from '../game-enums/enums'
import { Entity, IEntityDefinition } from './entity'

export class Actor extends Entity implements IActorDefinition {
    public turn_count : number
    public actorType : ActorType
    public name : string
    public fov : GridOfEntities<Bones.Enums.VisionSource>
    // memory_archive : IMemoryArchive = {}
    public memory : GridOfEntities<Bones.Entities.Entity>
    public knowledge : GridOfEntities<Bones.Entities.Actor>

    lastStepOffset : Bones.Coordinate

    constructor (actor_def : IActorDefinition) {
        super(actor_def)
        this.turn_count = 1
        this.actorType = actor_def.actorType
        this.name = actor_def.name
        this.lastStepOffset = new Bones.Coordinate(0, 0)
        this.clearFov()
        this.clearKnowledge()
        this.clearMemory()
    }

    act (game: Bones.Engine.Game) : Promise<Bones.Engine.InputResponse> {

        let mob_response : Bones.Engine.InputResponse
        mob_response = Bones.Actions.AI.getEventOnMonsterTurn(game, this)
        return Promise.resolve(mob_response)
    }

    public isPlayerControlled(): boolean {
        return false
    }
    
    public clearFov() {
        this.fov = new GridOfEntities<Bones.Enums.VisionSource>()
    }

    public clearMemory() {
        this.memory = new GridOfEntities<Bones.Entities.Entity>()
    }

    public clearKnowledge() {
        this.knowledge = new GridOfEntities<Bones.Entities.Actor>()
    }
    
}


export interface IActorDefinition extends IEntityDefinition {
    actorType : ActorType,
    name: string,
}

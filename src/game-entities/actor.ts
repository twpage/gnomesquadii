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
    hp_num : number
    stamina_num : number
    hp : Bones.Stat
    stamina : Bones.Stat
    lastStepOffset : Bones.Coordinate
    abilities : Array<Bones.Actions.Abilities.Ability>
    pathmap : Bones.Engine.Pathmap.Pathmap

    constructor (actor_def : IActorDefinition) {
        super(actor_def)
        this.turn_count = 1
        this.actorType = actor_def.actorType
        this.name = actor_def.name
        this.lastStepOffset = new Bones.Coordinate(0, 0)
        this.clearFov()
        this.clearKnowledge()
        this.clearMemory()

        this.hp = new Bones.Stat(Bones.Enums.StatName.Health, actor_def.hp_num)
        if (actor_def.stamina_num) {
            this.stamina = new Bones.Stat(Bones.Enums.StatName.Stamina, actor_def.stamina_num)
        } else {
            this.stamina = new Bones.Stat(Bones.Enums.StatName.Stamina, 0)
        }

        this.abilities = []
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
    public getAbilityOfType(abil_type) : Bones.Actions.Abilities.Ability {
        let abil_list = this.abilities.filter((value, index, array) => { return value.abil_type == abil_type })
        if (abil_list.length == 0) {
            return null
        } else {
            return abil_list[0]
        }
    }    
    public hasKnowledgeOf(seeking_entity: Bones.Entities.Entity) : boolean {
        for (let known_entity of this.knowledge.getAllEntities()) {
            if (known_entity.isSameAs(seeking_entity)) {
                return true
            }
        }
        return false
    }
}


export interface IActorDefinition extends IEntityDefinition {
    actorType : ActorType,
    name: string,
    hp_num: number,
    stamina_num?: number,
}

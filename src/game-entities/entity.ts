import * as Bones from '../bones'
import { Coordinate } from "../bones";
import { EntityType } from '../game-enums/enums';

export class Entity implements IEntityDefinition {
    public entityType : Bones.Enums.EntityType
    public code: string
    public color: Bones.ROTColor
    public bg_color : Bones.ROTColor
    public location: Coordinate
    public id: number

    constructor(entity_def: IEntityDefinition) {
        this.id = Bones.Utils.generateID()

        this.entityType = entity_def.entityType
        this.color = entity_def.color
        this.bg_color = entity_def.bg_color
        this.code = entity_def.code
        this.location = entity_def.location
    }

    isSameAs(other_entity: Entity) : boolean {
        return this.id == other_entity.id
    }
}

export interface IEntityDefinition {
    readonly entityType : EntityType
    code : string
    color: Bones.ROTColor
    bg_color? : Bones.ROTColor
    location? : Bones.Coordinate
}
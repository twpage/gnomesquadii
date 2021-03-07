import * as Bones from '../bones'
import { ActorType } from '../game-enums/enums'

export const HERO : Bones.Entities.IActorDefinition  = {
    entityType: Bones.Enums.EntityType.Actor,
    actorType: ActorType.HERO,
    name: 'Hero',
    code: '@',
    color: Bones.Color.black,
    bg_color: null,
}

export const ARCHITECT : Bones.Entities.IActorDefinition  = {
    entityType: Bones.Enums.EntityType.Actor,
    actorType: ActorType.ARCHITECT,
    name: 'Architect',
    code: '?',
    color: Bones.Color.black,
    bg_color: null,
}

export const MOB : Bones.Entities.IActorDefinition  = {
    entityType: Bones.Enums.EntityType.Actor,
    actorType: ActorType.MOB,
    name: 'Mob',
    code: 'x',
    color: Bones.Color.black,
    bg_color: null,
}

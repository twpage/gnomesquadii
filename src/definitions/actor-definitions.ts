import * as Bones from '../bones'
import { ActorType } from '../game-enums/enums'

export const PLAYER : Bones.Entities.IActorDefinition  = {
    entityType: Bones.Enums.EntityType.Actor,
    actorType: ActorType.PLAYER,
    name: 'PlayerControl',
    code: '?',
    color: Bones.Color.white,
    bg_color: null,
    hp_num: 1,
}

export const HERO : Bones.Entities.IActorDefinition  = {
    entityType: Bones.Enums.EntityType.Actor,
    actorType: ActorType.HERO,
    name: 'Hero',
    code: '@',
    color: Bones.Color.white,
    bg_color: null,
    hp_num: 3,
    stamina_num: 6,
}

export const ARCHITECT : Bones.Entities.IActorDefinition  = {
    entityType: Bones.Enums.EntityType.Actor,
    actorType: ActorType.ARCHITECT,
    name: 'Architect',
    code: '?',
    color: Bones.Color.white,
    bg_color: null,
    hp_num: 1,
}

export const MOB : Bones.Entities.IActorDefinition  = {
    entityType: Bones.Enums.EntityType.Actor,
    actorType: ActorType.MOB,
    name: 'Mob',
    code: 'x',
    color: Bones.Color.white,
    bg_color: null,
    hp_num: 1,
}

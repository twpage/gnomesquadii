import * as Bones from '../bones'
import { TerrainType } from '../game-enums/enums'

export const WALL : Bones.Entities.ITerrainDefinition  = {
    entityType: Bones.Enums.EntityType.Terrain,
    terrainType: TerrainType.WALL,
    code: '#',
    color: Bones.Color.slate_light,
    bg_color: Bones.Color.slate_med,
    blocksVision: true,
    blocksWalking: true,
}

export const FLOOR : Bones.Entities.ITerrainDefinition  = {
    entityType: Bones.Enums.EntityType.Terrain,
    terrainType: TerrainType.FLOOR,
    code: '.',
    color: Bones.Color.slate_med,
    bg_color: Bones.Color.slate_dark,
    blocksVision: false,
    blocksWalking: false,
}

export const DOOR_CLOSED : Bones.Entities.ITerrainDefinition  = {
    entityType: Bones.Enums.EntityType.Terrain,
    terrainType: TerrainType.DOOR_CLOSED,
    code: '+',
    color: Bones.Color.slate_dark,
    bg_color: Bones.Color.white,
    blocksVision: true,
    blocksWalking: false,
}

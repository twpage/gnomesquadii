import * as Bones from '../bones'
import { TerrainType } from '../game-enums/enums'

export const WALL : Bones.Entities.ITerrainDefinition  = {
    entityType: Bones.Enums.EntityType.Terrain,
    terrainType: TerrainType.WALL,
    code: '#',
    color: Bones.Color.white,
    bg_color: Bones.Color.gray,
    blocksVision: true,
    blocksWalking: true,
}

export const FLOOR : Bones.Entities.ITerrainDefinition  = {
    entityType: Bones.Enums.EntityType.Terrain,
    terrainType: TerrainType.FLOOR,
    code: '.',
    color: Bones.Color.gray,
    bg_color: Bones.Color.white,
    blocksVision: false,
    blocksWalking: false,
}

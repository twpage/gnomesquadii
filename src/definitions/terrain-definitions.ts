import * as Bones from '../bones'
import { TerrainType } from '../game-enums/enums'

export const WALL : Bones.Entities.ITerrainDefinition  = {
    entityType: Bones.Enums.EntityType.Terrain,
    terrainType: TerrainType.WALL,
    code: '#',
    color: Bones.Color.slate_65pc,
    bg_color: Bones.Color.slate_40pc,
    blocksVision: true,
    blocksWalking: true,
}

export const FLOOR : Bones.Entities.ITerrainDefinition  = {
    entityType: Bones.Enums.EntityType.Terrain,
    terrainType: TerrainType.FLOOR,
    code: '.',
    color: Bones.Color.slate_40pc,
    bg_color: Bones.Color.slate_20pc,
    blocksVision: false,
    blocksWalking: false,
}

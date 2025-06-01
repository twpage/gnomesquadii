import { TerrainType } from "../game-enums/enums";
import { Entity, IEntityDefinition } from "./entity";

export class Terrain extends Entity implements ITerrainDefinition {
    public terrainType: TerrainType
    public blocksWalking: boolean
    public blocksVision: boolean
    public blocksFlying: boolean

    constructor (terrain_def: ITerrainDefinition) {
        super(terrain_def)
        this.terrainType = terrain_def.terrainType
        this.blocksVision = terrain_def.blocksVision
        this.blocksWalking = terrain_def.blocksWalking
        this.blocksFlying = this.blocksWalking
    }

}

export interface ITerrainDefinition extends IEntityDefinition {
    terrainType: TerrainType
    blocksWalking: boolean
    blocksVision: boolean
}
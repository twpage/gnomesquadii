import * as ROT from 'rot-js'
import * as Bones from '../bones'
import { Actor } from '../game-entities'
import { Terrain } from '../game-entities/terrain'
import { CoordinateArea } from './coordinate-area'
import { GridOfEntities } from './grid'
import { ISize } from './utils'

interface INavigationTileList {
    [id : string] : Array<Bones.Coordinate>
}

interface ILevelGeneratorFunction { (r: Region, d: number) : boolean }

export class Region {
    public id: number
    public terrain: GridOfEntities<Terrain>
    public actors: GridOfEntities<Actor>
    // public highlights: GridOfEntities<Bones.ROTColor>

    public start_xy : Bones.Coordinate
    navigation_tiles: INavigationTileList

    constructor(public size: ISize, public depth: number, level_generator_fn: ILevelGeneratorFunction) {
        this.id = Bones.Utils.generateID()
        this.terrain = new GridOfEntities<Terrain>()
        this.actors = new GridOfEntities<Actor>()
        // this.highlights = new GridOfEntities<Bones.ROTColor>()

        this.navigation_tiles = {}
        this.navigation_tiles[Bones.Enums.LevelNavigationType.Walk] = []
        this.navigation_tiles[Bones.Enums.LevelNavigationType.Fly] = []

        // regionGenerator(this)
        level_generator_fn(this, depth)

        this.updateNavigation()
    }

    isValid(xy: Bones.Coordinate) : boolean {
        return (xy.x >= 0) && (xy.x < this.size.width) && (xy.y >= 0) && (xy.y < this.size.height)
    }

    isSafe(xy: Bones.Coordinate) : boolean {
        if (!(this.isValid(xy))) { return false }
        
        let t_at = this.terrain.getAt(xy)
        if (t_at.blocksWalking) { return false }

        let m_at = this.actors.getAt(xy)
        if (m_at) { return false }

        return true
    }

    getWalkableTerrain() : Bones.Coordinate[] {
        // return this.terrain.getAllCoordinatesAndEntities().filter((item) => { return !(item.entity.blocksWalking) }).map((item) => { return item.xy })
        return this.terrain.getAllCoordinatesAndEntities().filter(item => { return this.isSafe(item.xy) }).map((item) => { return item.xy })
    }

    getWalkableTerrainWithoutActors() : Bones.Coordinate[] {
        let walkable_area = new CoordinateArea(this.getWalkableTerrain())
        let actor_xys = this.actors.getAllCoordinates()
        let safe_xys = walkable_area.getCoordinatesExcept(actor_xys)
        return safe_xys
    }

    getSafeSpotsCloseTo(center_xy: Bones.Coordinate, required_spots: number) : Bones.Coordinate[] {
        let r = 1
        let spots_xys = new CoordinateArea()
        
        while (spots_xys.size() < required_spots) {
            let safe_surrounding_xys = Bones.Shapes.getCircle(center_xy, r).filter(xy => { return this.isSafe(xy)})
            for (let xy of safe_surrounding_xys) {
                spots_xys.addCoordinate(xy)
                if (spots_xys.size() == required_spots) { break }
            }

            r += 1
        }

        return spots_xys.getCoordinates()
    }

    updateNavigation() {
        let t : Bones.Entities.Terrain
        let xy : Bones.Coordinate

        for (let x = 1; x < (this.size.width - 1); x++) {
            for (let y = 1; y < (this.size.height - 1); y++) {
                xy = new Bones.Coordinate(x, y)
                t = this.terrain.getAt(xy)

                if (!(t.blocksWalking)) {
                    this.navigation_tiles[Bones.Enums.LevelNavigationType.Walk].push(xy)
                }

                if (!(t.blocksFlying)) {
                    this.navigation_tiles[Bones.Enums.LevelNavigationType.Fly].push(xy)
                }
            }
        }
    }

}


import * as ROT from 'rot-js'
import * as Bones from '../bones'
import { gameplayPanelRect } from '../config'
import { Terrain } from '../definitions'
import { Region } from './region'
interface ICoordsToConnect {
    from: [number, number],
    to: [number, number],
}
export function forestRegionGenerator(region: Region, difficulty: number) {
    // keep track of safe terrain while we generate
    let safe_xys : Bones.Coordinate[] = []

    let map = new ROT.Map.Cellular(region.size.width, region.size.height)//, { topology: 4 })
    map.randomize(0.5)
    for (let i = 0; i < 4; i++) { map.create() }

    let create_callback = (x: number, y: number, value: number) => {
        let xy = new Bones.Coordinate(x, y)
        
        let terrain : Bones.Entities.Terrain
        if (value == 0) {
            terrain = new Bones.Entities.Terrain(Bones.Definitions.Terrain.WALL)
        } else {
            terrain = new Bones.Entities.Terrain(Bones.Definitions.Terrain.FLOOR)
            safe_xys.push(xy)
        }
        if (region.terrain.hasAt(xy)) {
            region.terrain.removeAt(xy)
        }
        region.terrain.setAt(xy, terrain)        
    }
    // let pairs_to_connect : Array<ICoordsToConnect> = []
    let connect_callback = (from: any, to: any) => {
        // console.log(from, to)
        // pairs_to_connect.push({
        //     from: from,
        //     to: to
        // })
        // let xy = new Bones.Coordinate(x, y)
        // let terrain : Bones.Entities.Terrain
        // if (value == 1) {
        //     terrain = new Bones.Entities.Terrain(Bones.Definitions.Terrain.WALL)
        // } else {
        //     terrain = new Bones.Entities.Terrain(Bones.Definitions.Terrain.FLOOR)
        //     safe_xys.push(xy)
        // }

        // region.terrain.setAt(xy, terrain)        
    }
    map.create(create_callback)
    map.connect(create_callback, 1, connect_callback)
    // for (let coord_pair of pairs_to_connect) {
    //     let from_xy = new Bones.Coordinate(coord_pair.from[0], coord_pair.from[1])
    //     let to_xy = new Bones.Coordinate(coord_pair.to[0], coord_pair.to[1])
    //     let dijkstra = new ROT.Path.Dijkstra(to_xy.x, to_xy.y, (x, y) => { return true }, {topology: 4})
    //     let path_taken_xys : Bones.Coordinate[] =  []
    //     let fn_update_path = (x: number, y: number) : void => {
    //         // let xy = new Brew.Coordinate(x, y)
    //         path_taken_xys.push(new Bones.Coordinate(x, y))
    //     }
    //     dijkstra.compute(from_xy.x, from_xy.y, fn_update_path)

    //     for (let pathway_xy of path_taken_xys) {
    //         let terrain = new Bones.Entities.Terrain(Bones.Definitions.Terrain.FLOOR)
    //         region.terrain.setAt
    //         safe_xys.push(pathway_xy)
    //     }
    // }
    // shuffle our safe spaces first
    safe_xys = ROT.RNG.shuffle(safe_xys)
    region.start_xy = safe_xys.pop()

    addStartingMobSquads(region, 6, safe_xys)
    
    return true
}

function addStartingMobSquads(region: Region, num_squads: number, safe_xys: Array<Bones.Coordinate>) {
    // add some mob squads
    for (let squad_no = 0; squad_no < num_squads; squad_no++) {
        console.log(`mob squad number ${squad_no+1}`)
        let center_xy : Bones.Coordinate
        while (true) {
            center_xy = ROT.RNG.getItem(safe_xys)
            if (Bones.Utils.dist2d(region.start_xy, center_xy) >= 10) {
                break
            }
        }
        
        let mob_squad = createMobSquad(region.depth)
        let mob_xys = [center_xy].concat(region.getSafeSpotsCloseTo(center_xy, mob_squad.length - 1))
        for (let m = 0; m < mob_squad.length; m++) {
            let mob = mob_squad[m]
            let xy = mob_xys[m]
            region.actors.setAt(xy, mob)
            console.log(`landing ${mob.name} at ${xy}`)
        }
    }
}


export function simpleRegionGenerator(region: Region) {
    // generate terrain
    // keep track of safe terrain while we generate
    let safe_xys : Bones.Coordinate[] = []

    let callback = (x: number, y: number, value: number) => {
        let xy = new Bones.Coordinate(x, y)
        let terrain : Bones.Entities.Terrain
        if (value == 1) {
            terrain = new Bones.Entities.Terrain(Bones.Definitions.Terrain.WALL)
        } else {
            terrain = new Bones.Entities.Terrain(Bones.Definitions.Terrain.FLOOR)
            safe_xys.push(xy)
        }

        region.terrain.setAt(xy, terrain)
    }
    let d = new ROT.Map.Digger(region.size.width, region.size.height)
    d.create(callback)

    let doors_callback = (x: number, y: number) => {
        let xy = new Bones.Coordinate(x, y)
        let u = ROT.RNG.getUniform()
        if (u < 0.5) {
            region.terrain.removeAt(xy)
            region.terrain.setAt(xy, new Bones.Entities.Terrain(Bones.Definitions.Terrain.DOOR_CLOSED))
        }
    }

    // let rooms = d.getRooms()
    // for (let room of rooms) {
    //     room.getDoors(doors_callback)
    // }
    // shuffle our safe spaces first
    safe_xys = ROT.RNG.shuffle(safe_xys)

    // set a safe spot for the player
    region.start_xy = safe_xys.pop()

    addStartingMobSquads(region, 6, safe_xys)
    return true
}

// export function woodsRegionGenerator(region: Region) {
//     // generate terrain
//     // keep track of safe terrain while we generate
//     let safe_xys : Bones.Coordinate[] = []

//     let callback = (x: number, y: number, value: number) => {
//         let xy = new Bones.Coordinate(x, y)
//         let terrain : Bones.Entities.Terrain
//         if (value == 1) {
//             terrain = new Bones.Entities.Terrain(Bones.Definitions.Terrain.WALL)
//         } else {
//             terrain = new Bones.Entities.Terrain(Bones.Definitions.Terrain.FLOOR)
//             safe_xys.push(xy)
//         }

//         region.terrain.setAt(xy, terrain)
//     }

//     let num_rooms = 10
//     for (let r = 0; r < num_rooms; r++) {

//     }
    
//     // shuffle our safe spaces first
//     safe_xys = ROT.RNG.shuffle(safe_xys)

//     // set a safe spot for the player
//     region.start_xy = safe_xys.pop()

//     addStartingMobSquads(region, 6, safe_xys)
//     return true
// }

export function createMobSquad(difficulty: number) : Array<Bones.Entities.Actor> {
    let mob_squad_list : Array<Bones.Entities.Actor> = []

    let total_num_mobs = difficulty + 2

    let max_num_bones = Math.floor(difficulty / 3)
    let max_num_brutes = Math.floor(difficulty / 6)

    let num_bones = ROT.RNG.getUniformInt(0, max_num_bones)
    let num_brutes = ROT.RNG.getUniformInt(0, max_num_brutes)
    let max_num_spiders = Math.max(0, total_num_mobs - (num_bones + num_brutes))
    let num_spiders = ROT.RNG.getUniformInt(0, max_num_spiders)

    for (let i = 0; i < num_spiders; i++) {
        mob_squad_list.push(new Bones.Entities.Actor(Bones.Definitions.Actors.SPIDER))
    }

    for (let i = 0; i < num_bones; i++) {
        mob_squad_list.push(new Bones.Entities.Actor(Bones.Definitions.Actors.BONES))
    }

    for (let i = 0; i < num_brutes; i++) {
        mob_squad_list.push(new Bones.Entities.Actor(Bones.Definitions.Actors.BRUTE))
    }

    return mob_squad_list
}

export class levelGeneratorUtility {
    rotd : ROT.Display
    canvasElement : HTMLCanvasElement
    region : Bones.Region
    divElements : Bones.IDisplayDivElementIDs

    constructor(divElements : Bones.IDisplayDivElementIDs) {
        console.log("starting level gen util")

        this.divElements = divElements

        let view_width = Bones.Config.regionSize.width
        let view_height = Bones.Config.regionSize.height
        let tile_sq_size = Bones.Config.BASE_TILE_SIZE * Bones.Config.TILE_EXPANSION
        let canvasExpandedTileSet = <HTMLCanvasElement>document.getElementById("id_canvas")
    
        this.rotd = new ROT.Display({
            bg: ROT.Color.toHex(Bones.Color.default_bg),
            width: view_width,
            height: view_height,
            layout: "tile-gl",
            tileWidth: tile_sq_size,
            tileHeight: tile_sq_size,
            tileSet: canvasExpandedTileSet,//imgTileSet,
            tileMap: Bones.generateTileMap(tile_sq_size),
            tileColorize: true,
        })
    
        this.canvasElement = <HTMLCanvasElement>this.rotd.getContainer()
        let divMain : HTMLDivElement = <HTMLDivElement>document.getElementById(divElements.divMain)
        divMain.appendChild(this.canvasElement)
        
        window.addEventListener("keydown", (e) => { handleInput(this, e) })
        this.createNewRegionAndDraw()
    }

    createNewRegionAndDraw() {
        this.region = new Bones.Region(Bones.Config.regionSize, 1, Bones.LevelGen.forestRegionGenerator)

        let t : Bones.Entities.Terrain
        // let a : Bones.Entities.Actor
        let xy : Bones.Coordinate
        let color_fg = Bones.Color.white
        let color_bg = Bones.Color.black
    
        for (let mx = 0; mx < Bones.Config.regionSize.width; mx++) {
            for (let my = 0; my < Bones.Config.regionSize.height; my++) {
                xy = new Bones.Coordinate(mx, my)
                t = this.region.terrain.getAt(xy)
                this.rotd.draw(mx, my, t.code, ROT.Color.toHex(color_fg), ROT.Color.toHex(color_bg))
            }
        }
    }

}


function handleInput(util: levelGeneratorUtility, event: KeyboardEvent) {
    let code = event.keyCode
    if (code == ROT.KEYS.VK_SPACE) {
        util.createNewRegionAndDraw()
    }
}

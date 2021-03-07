import * as ROT from 'rot-js'
import * as Bones from './bones'

export interface IDisplayDivElementIDs {
    divMain: string
    divFooter: string
}

export class Display {
    private rotMainDisplay : ROT.Display
    private canvasElement : HTMLCanvasElement

    constructor(private game : Bones.Engine.Game, display_divs : IDisplayDivElementIDs) {
        let div_footer : HTMLDivElement = <HTMLDivElement>document.getElementById(display_divs.divFooter)
        div_footer.innerHTML = "<p>loaded typescript</p>"
    
        let divMain : HTMLDivElement = <HTMLDivElement>document.getElementById(display_divs.divMain)
        
        let font_size = 15
        let view_width = Bones.Config.viewableSize.width
        let view_height = Bones.Config.viewableSize.height
    
        this.rotMainDisplay = new ROT.Display({
            bg: "white",
            width: view_width,
            height: view_height,
            fontSize: font_size,
            fontFamily: 'Consolas',
            // fontStyle: 'bold',
            forceSquareRatio: true,
            spacing: 1.05
        })

        this.canvasElement = <HTMLCanvasElement>this.rotMainDisplay.getContainer()
        divMain.appendChild(this.canvasElement)
    
    }

    drawAll() {
        let xy : Bones.Coordinate

        // for (let x = 0; x < Bones.Config.regionSize.width; x++) {
        //     for (let y = 0; y < Bones.Config.regionSize.height; y++) {
        //         xy = new Bones.Coordinate(x, y)
        //         this.drawPoint(xy)
        //     }
        // }
        for (let v_xy of this.getViewWindow()) {
            this.drawPoint(v_xy)
        }
    }

    private getViewWindow() : Bones.Coordinate[] {
        let view_xys : Bones.Coordinate[] = []

        for (let x = 0; x < Bones.Config.viewableSize.width; x++) {
            for (let y = 0; y < Bones.Config.viewableSize.height; y++) {
                // this.drawPoint(new Coordinate(x, y))
                view_xys.push((new Bones.Coordinate(x, y)).add(this.game.cameraOffset))
            }
        }
        // console.log("viewport size: ", view_xys.length)
        return view_xys
    }

    drawList(coord_xys: Bones.Coordinate[]) {
        for (let xy of coord_xys) {
            this.drawPoint(xy)
        }
    }
    
    drawPoint(region_xy: Bones.Coordinate) {
        let screen_xy = region_xy.subtract(this.game.cameraOffset)

        let region = this.game.current_region
        let actor_at = region.actors.getAt(region_xy)
        let terrain_at = region.terrain.getAt(region_xy)
        
        let drawCode : string = ' '
        let drawFgColor : Bones.ROTColor = Bones.Color.white
        let drawBgColor : Bones.ROTColor = Bones.Color.dark_gray

        // drawCode = '?'
        // drawFgColor = Bones.Color.white
        // drawBgColor = Bones.Color.black

        // check if in player FOV
        let player = this.game.player
        let fov_at = player.fov.getAt(region_xy)
        if ((player.fov.hasAt(region_xy)) && (fov_at != Bones.Enums.VisionSource.NoVision)) {

            if (terrain_at) {
                drawCode = terrain_at.code
                drawFgColor = terrain_at.color
                drawBgColor = terrain_at.bg_color
            } 
            if (actor_at) {
                drawCode = actor_at.code
                drawFgColor = actor_at.color
                drawBgColor = [199, 199, 0]
            }
        } else {
            // check if in player memory
            let memory_at = player.memory.getAt(region_xy)
            if (memory_at) {
                drawCode = memory_at.code
                drawFgColor = Bones.Color.gray
                drawBgColor = Bones.Color.dark_gray
            }
        }

        this.rotMainDisplay.draw(screen_xy.x, screen_xy.y, drawCode, ROT.Color.toHex(drawFgColor), ROT.Color.toHex(drawBgColor))

    }

}
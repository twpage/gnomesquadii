import * as ROT from 'rot-js'
import * as Bones from './bones'
import { ActorType } from './game-enums/enums'
import { IRect } from './game-components/utils'

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
        let view_width = Bones.Config.fullWindowRect.size.width
        let view_height = Bones.Config.fullWindowRect.size.height
    
        this.rotMainDisplay = new ROT.Display({
            bg: ROT.Color.toHex(Bones.Color.default_bg),
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
    drawBorder() {
        for (let x = Bones.Config.fullWindowRect.topleft_xy.x; x < Bones.Config.fullWindowRect.size.width; x++) {
            this.rotMainDisplay.draw(x, Bones.Config.fullWindowRect.topleft_xy.y, ' ', ROT.Color.toHex(Bones.Color.white),ROT.Color.toHex(Bones.Color.light_gray))
            
            this.rotMainDisplay.draw(x, Bones.Config.gameplayPanelRect.size.height+1, ' ', ROT.Color.toHex(Bones.Color.white),ROT.Color.toHex(Bones.Color.light_gray))

            this.rotMainDisplay.draw(x, Bones.Config.fullWindowRect.topleft_xy.y + Bones.Config.fullWindowRect.size.height-1, ' ', ROT.Color.toHex(Bones.Color.white),ROT.Color.toHex(Bones.Color.light_gray))
        }

        for (let y = Bones.Config.fullWindowRect.topleft_xy.y; y < Bones.Config.fullWindowRect.size.height; y++) {
            this.rotMainDisplay.draw(Bones.Config.fullWindowRect.topleft_xy.x, y, ' ', ROT.Color.toHex(Bones.Color.white),ROT.Color.toHex(Bones.Color.light_gray))
            this.rotMainDisplay.draw(Bones.Config.fullWindowRect.topleft_xy.x + Bones.Config.fullWindowRect.size.width-1, y, ' ', ROT.Color.toHex(Bones.Color.white),ROT.Color.toHex(Bones.Color.light_gray))
            if (y <= Bones.Config.gameplayPanelRect.size.height) {
                this.rotMainDisplay.draw(Bones.Config.gameplayPanelRect.topleft_xy.x + Bones.Config.gameplayPanelRect.size.width, y, ' ', ROT.Color.toHex(Bones.Color.white),ROT.Color.toHex(Bones.Color.light_gray))
            }
        }
    }
    drawAll() {
        this.rotMainDisplay.clear()
        this.drawBorder()
        for (let v_xy of this.getViewWindow()) {
            this.drawPoint(v_xy)
        }

        this.drawInfoPanel()
        this.drawFooterPanel()
    }

    private getViewWindow() : Bones.Coordinate[] {
        let view_xys : Bones.Coordinate[] = []

        for (let x = 0; x < Bones.Config.gameplaySize.width; x++) {
            for (let y = 0; y < Bones.Config.gameplaySize.height; y++) {
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
        let screen_xy = region_xy.subtract(this.game.cameraOffset).add(Bones.Config.gameplayPanelRect.topleft_xy)

        let region = this.game.current_region

        let terrain_at = region.terrain.getAt(region_xy)
        let actor_at = region.actors.getAt(region_xy)
        
        let highlight_at : Bones.ROTColor = null
        if (this.game.tgt_interface) {
            highlight_at = this.game.tgt_interface.highlights.getAt(region_xy)
        }


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
                // drawBgColor = [199, 199, 0]
                if (actor_at.isSameAs(this.game.getActiveSquadMember())) {
                    drawBgColor = [199, 199, 0]
                }
            }
            if (highlight_at) {
                drawBgColor = highlight_at
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

    drawInfoPanel() {
        let chr : string
        let xy : Bones.Coordinate
        let max_width : number

        let badguys = this.game.player.knowledge.getAllEntities().filter(a => { return a.actorType != ActorType.HERO })
        let known_actors : Array<Bones.Entities.Actor> = [].concat(this.game.player_squad, badguys)

        this.clearRect(Bones.Config.infoPanelRect, Bones.Color.default_bg)

        let squad_avg_turns = Bones.Actions.Squad.getAverageSquadTurnCount(this.game)

        for (let row_number = 0; row_number < Bones.Config.infoPanelRect.size.height; row_number++) {
            if (row_number < known_actors.length) {
                let actor = known_actors[row_number]
                
                // sync indicator
                if (actor.isPlayerControlled()) {
                    let char = ''

                    xy = Bones.Config.infoPanelRect.topleft_xy.add(new Bones.Coordinate(0, row_number))

                    // show if actor is ahead or behind in turn count
                    let turncount_diff = actor.turn_count - squad_avg_turns
                    let turncount_diff_magnitude = Math.abs(turncount_diff)

                    if (turncount_diff_magnitude > (Bones.Config.RELATIVE_TIMEDIST_WARN / 4)) {
                        if (turncount_diff < 0) {
                            char = 'v'
                        } else {
                            char = '^'
                        }
                        this.rotMainDisplay.draw(xy.x, xy.y, char, ROT.Color.toHex(Bones.Color.white), ROT.Color.toHex(Bones.Color.default_bg))
                    }


                    // show warning first, then show signal if actor is in danger of getting out of time/dist sync
                    let actor_relative_timedist = Bones.Actions.Squad.calcActorRelativeTimeDist(this.game, actor)
                    
                    if (actor_relative_timedist >= Bones.Config.RELATIVE_TIMEDIST_MAX) {
                        this.rotMainDisplay.draw(xy.x+1, xy.y, '!', ROT.Color.toHex(Bones.Color.white), ROT.Color.toHex(Bones.Color.red))
                    } else if (actor_relative_timedist >= Bones.Config.RELATIVE_TIMEDIST_WARN) {
                        this.rotMainDisplay.draw(xy.x+1, xy.y, '!', ROT.Color.toHex(Bones.Color.default_bg), ROT.Color.toHex(Bones.Color.yellow))
                    }
                }

                // name
                xy = Bones.Config.infoPanelRect.topleft_xy.add(new Bones.Coordinate(2, row_number))
                max_width = 9
                let fg_color = Bones.Color.white
                let bg_color = Bones.Color.default_bg
                if (actor.isSameAs(this.game.getActiveSquadMember())) {
                    fg_color = Bones.Color.default_bg
                    bg_color = Bones.Color.white
                } else if ((this.game.tgt_interface) && (this.game.tgt_interface.target_xy.compare(actor.location))) {
                    fg_color = Bones.Color.default_bg
                    bg_color = Bones.Color.yellow
                }
                this.rotMainDisplay.drawText(xy.x, xy.y, colorize(actor.name, fg_color, bg_color), max_width)

                // health
                for (let i = 0; i < actor.hp.getMaxLevel(); i++) {
                    
                    if ((i + 1) <= actor.hp.getCurrentLevel()) {
                        chr = '\u2665'
                    } else {
                        chr = '\u2661'
                    }
                    xy = Bones.Config.infoPanelRect.topleft_xy.add(new Bones.Coordinate(11 + i, row_number))
                    this.rotMainDisplay.draw(xy.x, xy.y, chr, ROT.Color.toHex(Bones.Color.white), ROT.Color.toHex(Bones.Color.default_bg))
                }

                // stamina
                if (actor.stamina) {
                    for (let i = 0; i < actor.stamina.getMaxLevel(); i++) {

                        if ((i +1) <= actor.stamina.getCurrentLevel()) {
                            chr = '\u2666'
                        } else {
                            chr = '\u2662'
                        }
                        xy = Bones.Config.infoPanelRect.topleft_xy.add(new Bones.Coordinate(11 + 3 + i, row_number))
                        this.rotMainDisplay.draw(xy.x, xy.y, chr, ROT.Color.toHex(Bones.Color.slate_light), ROT.Color.toHex(Bones.Color.default_bg))
                    }
                } 
            }
        }
    }

    drawFooterPanel() {
        // line 1
        let row_number = 0
        let chr : string
        let text : string
        
        // line 1 hotkeys
        this.clearRect({ topleft_xy: Bones.Config.footerPanelRect.topleft_xy, size: { width: Bones.Config.footerPanelRect.size.width, height: 1}}, Bones.Color.slate_light)
        text = ""
        let active_abils = this.game.getHotKeyActions()
        for (let hotkey in active_abils) {
            let ability = active_abils[hotkey]
            text += `[${Number(hotkey)+1}] ${ability.getName()} `
        }
        let xy = Bones.Config.footerPanelRect.topleft_xy.add(new Bones.Coordinate(0, row_number))
        this.rotMainDisplay.drawText(xy.x, xy.y, colorize(text, Bones.Color.black, Bones.Color.slate_light))

        // line 2
        row_number = 1
        if (this.game.tgt_interface) {
            text = this.game.tgt_interface.target_xy.toString()
        } else {
            text = this.game.getActiveSquadMember().location.toString()
        }

        for (let i = 0; i < Bones.Config.footerPanelRect.size.width; i++) {
            let xy = Bones.Config.footerPanelRect.topleft_xy.add(new Bones.Coordinate(i, row_number))
            chr = (i < text.length) ? text[i] : ' '
            this.rotMainDisplay.draw(xy.x, xy.y, chr, ROT.Color.toHex(Bones.Color.white), ROT.Color.toHex(Bones.Color.default_bg))
        }
        
        
    }

    clearRect(rect: IRect, fill_color: Bones.ROTColor) {
        for (let x = 0; x < rect.size.width; x++) {
            for (let y = 0; y < rect.size.height; y++) {
                this.rotMainDisplay.draw(rect.topleft_xy.x + x, rect.topleft_xy.y + y, ' ', ROT.Color.toHex(fill_color), ROT.Color.toHex(fill_color))
            }
        }
    }
}

function colorize(text: string, fg_color: Bones.ROTColor, bg_color: Bones.ROTColor = Bones.Color.default_bg) : string {
    let fg_hex = ROT.Color.toHex(fg_color)
    let bg_hex = ROT.Color.toHex(bg_color)
    return `%c{${fg_hex}}%b{${bg_hex}}${text}%c{}%b{}`

}
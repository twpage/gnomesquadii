import * as ROT from 'rot-js'
import * as Bones from './bones'
import { AbilityType, ActorType } from './game-enums/enums'
import { IRect } from './game-components/utils'
import { Abilities } from './game-actions'
import { InputUtility } from './game-engine'

export interface IDisplayDivElementIDs {
    divMain: string
    divFooter: string
}

export class Display {
    private rotMainDisplay : ROT.Display
    private canvasElement : HTMLCanvasElement
    private imgTileSetElement : HTMLImageElement
    
    constructor(private game : Bones.Engine.Game, display_divs : IDisplayDivElementIDs) {

        // this.imgTileSetElement = document.createElement("img")
        // this.imgTileSetElement.src = "monochrome-transparent_packed.png"
        let imgTileSet = <HTMLImageElement>document.getElementById("id_tileset")
        let canvasExpandedTileSet = <HTMLCanvasElement>document.getElementById("id_canvas")
        // console.log(imgTileSet)
        let tile_sq_size = Bones.Config.BASE_TILE_SIZE * Bones.Config.TILE_EXPANSION

        // let width = 1664
        // let height = 746
        // let canvas = document.createElement("canvas");
        // canvas.width = width
        // canvas.height = height
        // let ctx = canvas.getContext("2d");
        // ctx.drawImage(this.imgTileSetElement, 0, 0, width, height);

        // let div_footer : HTMLDivElement = <HTMLDivElement>document.getElementById(display_divs.divFooter)
        // div_footer.innerHTML = "<p>loaded typescript</p>"
    
        let divMain : HTMLDivElement = <HTMLDivElement>document.getElementById(display_divs.divMain)
        
        // let font_size = 15
        let view_width = Bones.Config.fullWindowRect.size.width
        let view_height = Bones.Config.fullWindowRect.size.height
    
        // this.rotMainDisplay = new ROT.Display({
        //     bg: ROT.Color.toHex(Bones.Color.default_bg),
        //     width: view_width,
        //     height: view_height,
        //     fontSize: font_size,
        //     fontFamily: 'Consolas',
        //     // fontStyle: 'bold',
        //     forceSquareRatio: true,
        //     spacing: 1.05
        // })

        this.rotMainDisplay = new ROT.Display({
            bg: ROT.Color.toHex(Bones.Color.default_bg),
            width: view_width,
            height: view_height,
            layout: "tile-gl",
            tileWidth: tile_sq_size,
            tileHeight: tile_sq_size,
            tileSet: canvasExpandedTileSet,//imgTileSet,
            tileMap: generateTileMap(tile_sq_size),
            tileColorize: true,
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
        if (
            (screen_xy.x < Bones.Config.gameplayPanelRect.topleft_xy.x) || 
            (screen_xy.x >= (Bones.Config.gameplayPanelRect.topleft_xy.x + Bones.Config.gameplayPanelRect.size.width)) ||
            (screen_xy.y < Bones.Config.gameplayPanelRect.topleft_xy.y) || 
            (screen_xy.y >= (Bones.Config.gameplayPanelRect.size.height + Bones.Config.gameplayPanelRect.topleft_xy.y))
        ) {
            // console.log(`skipping out of screen draw for ${screen_xy}`)
            return false
        }
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
                if (actor_at.isPlayerControlled()) {
                    let pactor_at = <Bones.Entities.PlayerActor>actor_at
                    if (pactor_at.isLeader()) {
                        drawFgColor = Bones.Color.orange
                    }
                }
                
                // drawBgColor = [199, 199, 0]
                if (actor_at.isSameAs(this.game.getActiveSquadMember())) {
                    // change highlight based on reloaded
                    let shoot_abil = actor_at.getAbilityOfType(AbilityType.Shoot)
                    if (shoot_abil.charges.isEmpty()) {
                        drawBgColor = [139, 139, 0]
                    } else {
                        drawBgColor = [199, 199, 0]
                    }
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
                        this.rotMainDisplay.draw(xy.x, xy.y, char.toUpperCase(), ROT.Color.toHex(Bones.Color.white), ROT.Color.toHex(Bones.Color.default_bg))
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
                this.rotMainDisplay.drawText(xy.x, xy.y, colorize(actor.name.toUpperCase(), fg_color, bg_color), max_width)

                // health
                for (let i = 0; i < actor.hp.getMaxLevel(); i++) {
                    
                    if ((i + 1) <= actor.hp.getCurrentLevel()) {
                        chr = Bones.Symbols.heart_empty
                    } else {
                        chr = Bones.Symbols.heart_full
                    }
                    xy = Bones.Config.infoPanelRect.topleft_xy.add(new Bones.Coordinate(11 + i, row_number))
                    this.rotMainDisplay.draw(xy.x, xy.y, chr, ROT.Color.toHex(Bones.Color.white), ROT.Color.toHex(Bones.Color.default_bg))
                }

                // stamina
                if (actor.stamina) {
                    for (let i = 0; i < actor.stamina.getMaxLevel(); i++) {

                        if ((i +1) <= actor.stamina.getCurrentLevel()) {
                            chr = Bones.Symbols.bar_empty
                        } else {
                            chr = Bones.Symbols.bar_full
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
        this.clearRect({ topleft_xy: Bones.Config.footerPanelRect.topleft_xy.add(new Bones.Coordinate(0, 1)), size: { width: Bones.Config.footerPanelRect.size.width, height: Bones.Config.footerPanelRect.size.height}}, Bones.Color.default_bg)

        text = ""

        // let active_abils = this.game.getHotKeyActions()
        // let base_menu_abils = []
        let active_menu_abils : Array<Bones.Actions.Abilities.Ability> = this.game.getCurrentMenuBarAbilities()
        let xy = Bones.Config.footerPanelRect.topleft_xy.add(new Bones.Coordinate(0, row_number))
        let color_fg = Bones.Color.black
        let color_bg = Bones.Color.slate_light
        let color_highlight = Bones.Color.white

        for (let hotkey in active_menu_abils) {
            // let ability = active_abils[hotkey]
            let ability = active_menu_abils[hotkey]
            // show hotkeys if at the base menu
            if (this.game.menu_index == null) {
                text += colorize(`[${Number(hotkey)+1}] ${ability.getName().toUpperCase()} `, color_fg, color_bg)
            
            // if we are in a sub-menu, show current selection as highlighted
            } else if ((this.game.menu_index != null) && (hotkey == this.game.menu_index.toString())) {
                // text += `[ ${ability.getName()} ] `
                text += colorize(`[ ${ability.getName().toUpperCase()} ] `, color_bg, color_highlight)
            } else {
                // text += `${ability.getName()} `
                text += colorize(`${ability.getName().toUpperCase()} `, color_fg, color_bg)
            }
        }
        
        // this.rotMainDisplay.drawText(xy.x, xy.y, colorize(text.toUpperCase(), Bones.Color.black, Bones.Color.slate_light))    
        // console.log(text.toUpperCase())
        this.rotMainDisplay.drawText(xy.x, xy.y, text)

        // message buffer
        row_number = 1
        let message_lines = this.game.messages.getMessages()
        
        for (let message_line_no = 0; message_line_no < message_lines.length; message_line_no++) {
            let xy = Bones.Config.footerPanelRect.topleft_xy.add(new Bones.Coordinate(0, row_number + message_line_no))
            this.rotMainDisplay.drawText(xy.x, xy.y, message_lines[message_line_no].toUpperCase())
        }
        
        // line 6
        row_number = 6
        // if (this.game.tgt_interface) {
        //     text = this.game.tgt_interface.target_xy.toString()
        // } else {
        //     text = this.game.getActiveSquadMember().location.toString()
        // }
        if (this.game.menu_index == null) {
            text = `Difficulty: ${this.game.difficulty} Score: ${this.game.mobs_slain}`
        } else {
            text = "[1] Confirm [2] Cancel [3] Next [4] Prev"
        }
        
        for (let i = 0; i < Bones.Config.footerPanelRect.size.width; i++) {
            let xy = Bones.Config.footerPanelRect.topleft_xy.add(new Bones.Coordinate(i, row_number))
            chr = (i < text.length) ? text[i] : ' '
            this.rotMainDisplay.draw(xy.x, xy.y, chr.toUpperCase(), ROT.Color.toHex(Bones.Color.black), ROT.Color.toHex(Bones.Color.light_gray))
        }
        
        // let xy2 = Bones.Config.footerPanelRect.topleft_xy.add(new Bones.Coordinate(0, row_number))
        // this.rotMainDisplay.drawText(xy2.x, xy2.y, text.toUpperCase())
        
    }

    clearRect(rect: IRect, fill_color: Bones.ROTColor) {
        for (let x = 0; x < rect.size.width; x++) {
            for (let y = 0; y < rect.size.height; y++) {
                this.rotMainDisplay.draw(rect.topleft_xy.x + x, rect.topleft_xy.y + y, ' ', ROT.Color.toHex(fill_color), ROT.Color.toHex(fill_color))
            }
        }
    }
    
    getRotDisplay() : ROT.Display {
        return this.rotMainDisplay
    }
}

function colorize(text: string, fg_color: Bones.ROTColor, bg_color: Bones.ROTColor = Bones.Color.default_bg) : string {
    let fg_hex = ROT.Color.toHex(fg_color)
    let bg_hex = ROT.Color.toHex(bg_color)
    return `%c{${fg_hex}}%b{${bg_hex}}${text}%c{}%b{}`

}

export function generateTileMap(tile_sq_size: number): { [key: string]: [number, number] } {

    let tfn = (x: number, y: number) => {
        return getTileMapScaledXY(tile_sq_size, x, y)
    }

    let tile_map : { [key: string]: [number, number] } = {
        "": tfn(0, 0),
        " ": tfn( 0, 0),
        "[": tfn(26, 20),
        "]": tfn(24, 20),
        "(": tfn(26, 20),
        ")": tfn(24, 20),

        "0": tfn(35, 17),
        "1": tfn(36, 17),
        "2": tfn(37, 17),
        "3": tfn(38, 17),
        "4": tfn(39, 17),
        "5": tfn(40, 17),
        "6": tfn(41, 17),
        "7": tfn(42, 17),
        "8": tfn(43, 17),
        "9": tfn(44, 17),

        "@": tfn(30, 1),
        "x": tfn(21, 7),
        "?": tfn(13, 37),
        "+": tfn(10, 9),
        "%": tfn(39, 20),
        // "*": tfn()
        ":": tfn(45, 17),

        "#": tfn(0, 1),

        ".": tfn(5, 0),
        ",": tfn(6, 0),

        "v": tfn(30, 20),
        "^": tfn(28, 20),
        "!": tfn(35, 13),

        "A": tfn(35, 18),
        "B": tfn(36, 18),
        "C": tfn(37, 18),
        "D": tfn(38, 18),
        "E": tfn(39, 18),
        "F": tfn(40, 18),
        "G": tfn(41, 18),
        "H": tfn(42, 18),
        "I": tfn(43, 18),
        "J": tfn(44, 18),
        "K": tfn(45, 18),
        "L": tfn(46, 18),
        "M": tfn(47, 18),

        "N": tfn(35, 19),
        "O": tfn(36, 19),
        "P": tfn(37, 19),
        "Q": tfn(38, 19),
        "R": tfn(39, 19),
        "S": tfn(40, 19),
        "T": tfn(41, 19),
        "U": tfn(42, 19),
        "V": tfn(43, 19),
        "W": tfn(44, 19),
        "X": tfn(45, 19),
        "Y": tfn(46, 19),
        "Z": tfn(47, 19),
        "SPIDER": tfn(30, 5),
        "BONES": tfn(29, 6),
        "BRUTE": tfn(31, 6),
        "'": tfn(25, 20),
    }
    tile_map[Bones.Symbols.heart_full] = tfn(40, 10)
    tile_map[Bones.Symbols.heart_empty] = tfn(42, 10)
    tile_map[Bones.Symbols.bar_full] = tfn(27, 20)
    tile_map[Bones.Symbols.bar_empty] = tfn(27, 21)

    return tile_map
}

function getTileMapScaledXY(tile_sq_size: number, grid_x: number, grid_y: number) : [number, number] {
    let tile_image_x = (grid_x * tile_sq_size) //+ grid_x + 1
    let tile_image_y = (grid_y * tile_sq_size) //+ grid_y + 1

    return [tile_image_x, tile_image_y]
}
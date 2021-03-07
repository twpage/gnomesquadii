import * as  ROT from 'rot-js/lib/index'
import * as Bones from './bones'

function startMe() {
    // ROT.RNG.setSeed(1111)

    let divElementsIDs : Bones.IDisplayDivElementIDs = {
        divMain: "div_display",
        divFooter: "div_footer"
    }
    let game = new Bones.Engine.Game(divElementsIDs)
    game.gameLoop()
}


startMe()
import * as  ROT from 'rot-js/lib/index'
import * as Bones from './bones'

function startMe() {
    let seed = ROT.RNG.getUniformInt(1000,9999)
    console.log(`running seed # ${seed}`)
    ROT.RNG.setSeed(3150)

    let divElementsIDs : Bones.IDisplayDivElementIDs = {
        divMain: "div_display",
        divFooter: "div_footer"
    }
    let game = new Bones.Engine.Game(divElementsIDs)
    game.gameLoop()
}


startMe()
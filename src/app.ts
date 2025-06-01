import * as  ROT from 'rot-js/lib/index'
import * as Bones from './bones'

function getParameterByName(name: string) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

var run_levelgen = Boolean(getParameterByName("levelgen"))
var given_seed = getParameterByName("seed")

function startMe() {
    
    let seed : number

    if (given_seed) {
        seed = Number(given_seed)
    } else {
        seed = ROT.RNG.getUniformInt(1000,9999)
    }

    console.log(`running seed # ${seed}`)
    ROT.RNG.setSeed(seed)//3150

    let divElementsIDs : Bones.IDisplayDivElementIDs = {
        divMain: "div_display",
        divFooter: "div_footer"
    }

    let htmlCanvasResizedTiles = document.createElement("canvas")
    htmlCanvasResizedTiles.setAttribute("id", "id_canvas")
    htmlCanvasResizedTiles.hidden = true

    let htmlImgTiles = document.createElement("img")
    htmlImgTiles.hidden = true

    document.body.appendChild(htmlImgTiles)
    document.body.appendChild(htmlCanvasResizedTiles)

    htmlImgTiles.onload = function ()  {
        console.log("tile set image loaded")
    
        let width = 49 * Bones.Config.BASE_TILE_SIZE * Bones.Config.TILE_EXPANSION
        let height = 22 * Bones.Config.BASE_TILE_SIZE * Bones.Config.TILE_EXPANSION
        htmlCanvasResizedTiles.width = width
        htmlCanvasResizedTiles.height = height
        let ctx = htmlCanvasResizedTiles.getContext("2d")
        ctx.drawImage(htmlImgTiles, 0, 0, width, height);
    
        if (run_levelgen) {
            let levelgenutil = new Bones.LevelGen.levelGeneratorUtility(divElementsIDs)
            // levelgenutil.utilLoop()
            
        } else {
            let game = new Bones.Engine.Game(divElementsIDs)
            game.gameLoop()
        }

    }
    htmlImgTiles.setAttribute("id", "id_tileset")
    htmlImgTiles.src = "monochrome-transparent_packed.png"
}


startMe()
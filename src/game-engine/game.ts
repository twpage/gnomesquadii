import * as  ROT from 'rot-js/lib/index'
import Simple from "rot-js/lib/scheduler/simple"
import * as Bones from '../bones'
import { Coordinate } from '../game-components'
import { GameEvent } from './events'


export class Game {
    scheduler : Simple
    player : Bones.Entities.PlayerActor
    architect : Bones.Entities.Actor
    event_queue : Bones.Engine.Events.GameEvent[]
    current_region : Bones.Region
    display : Bones.Display
    cameraOffset : Bones.Coordinate

    constructor(divElements : Bones.IDisplayDivElementIDs) {
        this.display = new Bones.Display(this, divElements)
        this.scheduler = new ROT.Scheduler.Simple()
        this.player = new Bones.Entities.PlayerActor(Bones.Definitions.Actors.HERO)
        this.architect = new Bones.Entities.Actor(Bones.Definitions.Actors.ARCHITECT)
        this.architect.name = "architect"

        this.cameraOffset = new Bones.Coordinate(0, 0)

        let first_region = new Bones.Region(Bones.Config.regionSize, 1)
        this.setCurrentRegion(first_region)
    }
    
    setCurrentRegion(region: Bones.Region) {
        // load a new region
        this.current_region = region

        // clear scheduler first
        this.scheduler.clear()

        // add all actors from this region into our scheduler
        for (let a of region.actors.getAllEntities()) {
            this.scheduler.add(a, true)
        }

        // add our player
        this.scheduler.add(this.player, true)
        region.actors.setAt(region.start_xy, this.player)
        
        // add architect
        this.scheduler.add(this.architect, true)

        // re-center camera
        this.centerCameraOn(this.player)

        // draw everything
        this.display.drawAll()

        return true
    }

    public async gameLoop() {

        while (1) {
            let actor = this.scheduler.next()
            if (!actor) { break }

            let current_turn_count = actor.turn_count
            this.event_queue = []
            while (actor.turn_count == current_turn_count) {

                // refresh screen for player
                let updates_xys : Coordinate[] = []
                if (actor.location) {
                    updates_xys = Bones.Engine.FOV.updateFieldOfViewFor(this, actor)
                }
                if (actor.isPlayerControlled()) {
                    let updated_camera = this.centerCameraOn(actor)
                    // let updated_camera = this.resetCameraOn(actor)
                    if (updated_camera) {
                        this.display.drawAll()
                    } else {
                        this.display.drawList(updates_xys)
                    }
                }
                
                let ir : Bones.Engine.InputResponse = await actor.act(this)
                let next_event : GameEvent

                if (actor.isPlayerControlled()) {

                    // translate player inputs first 
                    next_event = Bones.Engine.Events.convertPlayerInputToEvent(this, actor, ir)
                    // new Bones.Engine.Events.GameEvent(actor, ir.event_type, true)
                } else {
                    // AI can just give you the event directly
                    next_event = ir.actualEvent
                }
                
                this.event_queue.push(next_event)
                
                while (this.event_queue.length > 0) {
                    await Bones.Engine.Events.processEvents(this)
                }
            }
        }
    }

    addEventToQueue(queued_event: GameEvent) {
        this.event_queue.push(queued_event)
    }

    centerCameraOn(player_actor: Bones.Entities.Actor) : boolean {
        let player_xy = player_actor.location
        let half_disp_width = Math.floor(Bones.Config.viewableSize.width / 2)
        let half_disp_height =  Math.floor(Bones.Config.viewableSize.height / 2)

        let camera_x : number
        let camera_y : number

        if (player_xy.x < half_disp_width) {
            camera_x = 0
        } else if (player_xy.x > (Bones.Config.regionSize.width - half_disp_width)) {
            camera_x = Bones.Config.regionSize.width - Bones.Config.viewableSize.width
        } else {
            camera_x = player_xy.x - half_disp_width
        }

        if (player_xy.y < half_disp_height) {
            camera_y = 0
        } else if (player_xy.y > (Bones.Config.regionSize.height - half_disp_height)) {
            camera_y = Bones.Config.regionSize.height - Bones.Config.viewableSize.height
        } else {
            camera_y = player_xy.y - half_disp_height
        }

        let camera_xy = new Bones.Coordinate(camera_x, camera_y)
        // console.log(camera_xy.toString())
        let old_camera_xy = this.cameraOffset.clone()
        this.cameraOffset = camera_xy

        return (!(camera_xy.compare(old_camera_xy)))
    }

    resetCameraOn(player_actor: Bones.Entities.Actor) : boolean { // returns true if camera changed
        // only scroll when within the last /5th of the screen
        let player_map_xy = player_actor.location
        let player_screen_xy = player_actor.location.subtract(this.cameraOffset)

        let fifth_disp_width = Math.floor(Bones.Config.viewableSize.width / 5)
        let fifth_disp_height =  Math.floor(Bones.Config.viewableSize.height / 5)

        let fourfifths_disp_width = Math.floor(Bones.Config.viewableSize.width * 4 / 5)
        let fourfifths_disp_height =  Math.floor(Bones.Config.viewableSize.height * 4 / 5)

        let camera_offset_x : number = 0
        let camera_offset_y : number = 0

        if ((player_screen_xy.x < fifth_disp_width) && (player_actor.lastStepOffset.x < 0)) {
            camera_offset_x = -1
        } else if ((player_screen_xy.x > fourfifths_disp_width) && (player_actor.lastStepOffset.x > 0)) {
            camera_offset_x = +1
        }

        if ((player_screen_xy.y < fifth_disp_height) && (player_actor.lastStepOffset.y < 0)) {
            camera_offset_y = -1
        } else if ((player_screen_xy.y > fourfifths_disp_height) && (player_actor.lastStepOffset.y > 0)) {
            camera_offset_y = +1
        }
        
        // let camera_x = Math.max(0, Math.min(this.mapSize.width - Bones.Config.viewableSize.width, this.cameraOffset.x + camera_offset_x))
        // let camera_y = Math.max(0, Math.min(this.mapSize.height - Bones.Config.viewableSize.height, this.cameraOffset.y + camera_offset_y))

        let camera_x = this.cameraOffset.x + camera_offset_x
        let camera_y = this.cameraOffset.y + camera_offset_y

        let camera_xy = new Bones.Coordinate(camera_x, camera_y)
        // console.log(camera_xy.toString())
        let old_camera_xy = this.cameraOffset.clone()
        this.cameraOffset = camera_xy
        return (!(camera_xy.compare(old_camera_xy)))

        
    }
}
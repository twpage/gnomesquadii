import * as  ROT from 'rot-js/lib/index'
import Simple from "rot-js/lib/scheduler/simple"
import * as Bones from '../bones'
import { Coordinate } from '../game-components'
import { GameEvent } from './events'
import { ActorType, InputHandlerType } from '../game-enums/enums'


export class Game {
    scheduler : Simple
    player : Bones.Entities.PlayerActor
    player_squad : Array<Bones.Entities.PlayerActor>
    active_squad_index : number
    architect : Bones.Entities.Actor
    event_queue : Bones.Engine.Events.GameEvent[]
    current_region : Bones.Region
    display : Bones.Display
    cameraOffset : Bones.Coordinate
    tgt_interface : Bones.Actions.Targeting.TargetingInterface

    constructor(divElements : Bones.IDisplayDivElementIDs) {
        this.display = new Bones.Display(this, divElements)
        this.scheduler = new ROT.Scheduler.Simple()

        this.player = new Bones.Entities.PlayerActor(Bones.Definitions.Actors.PLAYER)
        this.architect = new Bones.Entities.Actor(Bones.Definitions.Actors.ARCHITECT)

        this.initPlayerSquad()

        this.cameraOffset = new Bones.Coordinate(0, 0)

        let first_region = new Bones.Region(Bones.Config.regionSize, 1)
        this.setCurrentRegion(first_region)
    }
    
    getActiveSquadMember() : Bones.Entities.PlayerActor {
        return this.player_squad[this.active_squad_index]
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

        // add our player to the queue but NOT to the level
        this.scheduler.add(this.player, true)
        // region.actors.setAt(region.start_xy, this.player)

        // add our player squad to the level but NOT to the queue
        let valid_start_xys = region.getSafeSpotsCloseTo(region.start_xy, this.player_squad.length)
        let num_spots = Math.min(valid_start_xys.length, this.player_squad.length)
        if (num_spots < this.player_squad.length) {
            console.warn("not enough starting spots)")
        }
        for (let i = 0; i < num_spots; i++) {
            let surr_xy = valid_start_xys[i]
            region.actors.setAt(surr_xy, this.player_squad[i])
            console.log(`setting actor ${this.player_squad[i].name} at ${surr_xy}`)
        }
        
        // add architect
        this.scheduler.add(this.architect, true)

        // re-center camera
        this.centerCameraOn(this.getActiveSquadMember())

        // draw everything
        this.display.drawAll()

        return true
    }

    public async gameLoop() {

        while (1) {
            let actor = this.scheduler.next()
            // console.log(`next actor`, actor)
            if (!actor) { break }

            let current_turn_count = actor.turn_count
            this.event_queue = []
            while (actor.turn_count == current_turn_count) {

                // refresh screen for player
                let updates_xys : Coordinate[] = []
                if (actor.actorType == ActorType.PLAYER) {
                    updates_xys = Bones.Engine.FOV.setSquadFieldOfViewFor(this, actor)
                } else if (actor.location) {
                    updates_xys = Bones.Engine.FOV.updateFieldOfViewFor(this, actor)
                }

                if (actor.isPlayerControlled()) {
                    if ( this.player_squad.length == 0) { break }
                    let updated_camera = this.centerCameraOn(this.getActiveSquadMember())
                    // let updated_camera = this.resetCameraOn(actor)
                    if (updated_camera) {
                        this.display.drawAll()
                    } else {
                        this.display.drawList(updates_xys)
                    }
                    this.display.drawInfoPanel()
                }
                // show targeting overlay
                if (this.tgt_interface) {
                    this.display.drawList(this.tgt_interface.highlights.getAllCoordinates())
                    this.display.drawFooterPanel()
                    this.display.drawInfoPanel()
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
        let half_disp_width = Math.floor(Bones.Config.gameplaySize.width / 2)
        let half_disp_height =  Math.floor(Bones.Config.gameplaySize.height / 2)

        let camera_x : number
        let camera_y : number

        if (player_xy.x < half_disp_width) {
            camera_x = 0
        } else if (player_xy.x > (Bones.Config.regionSize.width - half_disp_width)) {
            camera_x = Bones.Config.regionSize.width - Bones.Config.gameplaySize.width
        } else {
            camera_x = player_xy.x - half_disp_width
        }

        if (player_xy.y < half_disp_height) {
            camera_y = 0
        } else if (player_xy.y > (Bones.Config.regionSize.height - half_disp_height)) {
            camera_y = Bones.Config.regionSize.height - Bones.Config.gameplaySize.height
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

        let fifth_disp_width = Math.floor(Bones.Config.gameplaySize.width / 5)
        let fifth_disp_height =  Math.floor(Bones.Config.gameplaySize.height / 5)

        let fourfifths_disp_width = Math.floor(Bones.Config.gameplaySize.width * 4 / 5)
        let fourfifths_disp_height =  Math.floor(Bones.Config.gameplaySize.height * 4 / 5)

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

    initPlayerSquad() {
        this.player_squad = [
            new Bones.Entities.PlayerActor(Bones.Definitions.Actors.HERO),
            new Bones.Entities.PlayerActor(Bones.Definitions.Actors.HERO),
            new Bones.Entities.PlayerActor(Bones.Definitions.Actors.HERO)
        ]
        this.active_squad_index = 0
        this.player_squad[0].name = "Griz"
        this.player_squad[1].name = "DotCom"
        this.player_squad[2].name = "Tracy"

        for (let i = 0; i < this.player_squad.length; i++) {
              this.player_squad[i].abilities.push(new Bones.Actions.Ability(Bones.Enums.AbilityType.Musket))
              this.player_squad[i].abilities.push(new Bones.Actions.Ability(Bones.Enums.AbilityType.Dash))
              this.player_squad[i].abilities.push(new Bones.Actions.Ability(Bones.Enums.AbilityType.Camp))
        }
    }
}
import * as Bones from '../bones'
import { GameEvent } from '../game-engine/events'

export function execAttack(game: Bones.Engine.Game, actor: Bones.Entities.Actor, from_xy: Bones.Coordinate, to_xy: Bones.Coordinate, target: Bones.Entities.Actor) : boolean {
    console.log(`${actor.name} attacks ${target.name}`)
    game.messages.addMessage(`${actor.name} attacks ${target.name}`)
    if ((target.stamina) && (target.stamina.getCurrentLevel() > 0)) {
        target.stamina.decrement(1)
    } else {
        target.hp.decrement(1)
    }
    game.display.drawInfoPanel()
    
    if (target.hp.isEmpty()) {
        if (target.actorType != Bones.Enums.ActorType.HERO) {
            return killMonster(game, target, actor)
    
        } else {
            return killSquadMember(game, target, actor)
        }
    } else {
        
        return true
    }  

}

function killMonster(game: Bones.Engine.Game, victim: Bones.Entities.Actor, murderer: Bones.Entities.Actor): boolean {
    let region = game.current_region
    let victim_xy = victim.location.clone()
    game.messages.addMessage(`${victim.name} is killed`)

    region.actors.removeAt(victim_xy)
    game.scheduler.remove(victim)
    game.display.drawPoint(victim_xy)
    game.mobs_slain += 1
    game.display.drawFooterPanel()
    return true
}

function killSquadMember(game: Bones.Engine.Game, victim: Bones.Entities.Actor, murderer: Bones.Entities.Actor): boolean {
    let region = game.current_region
    let victim_xy = victim.location.clone()
    game.messages.addMessage(`${victim.name} has died`)
    region.actors.removeAt(victim_xy)
    // game.scheduler.remove(victim)
    game.display.drawPoint(victim_xy)

    if (game.player_squad.length == 1) {
        runEndOfGame(game)
        return false
    } else {
        // if (game.getActiveSquadMember().isSameAs(victim)) {
        //     game.addEventToQueue(new GameEvent(game.player, Bones.Enums.EventType.CYCLE_SQUAD, false))
        // }
    }
    // find squad member index
    let idx = Bones.Actions.Squad.getSquadMemberIndexFor(game, victim)
    if (idx > -1) {
        game.player_squad.splice(idx, 1)
    }
    game.active_squad_index = 0
    game.display.drawInfoPanel()
    return true
}

export function execCriticalShot(game: Bones.Engine.Game, actor: Bones.Entities.Actor, from_xy: Bones.Coordinate, to_xy: Bones.Coordinate, target: Bones.Entities.Actor) : boolean {
    console.log(`${actor.name} crit-shots ${target.name}`)
    game.messages.addMessage(`${actor.name} bullseyes ${target.name}`)

    if ((target.stamina) && (target.stamina.getCurrentLevel() > 0)) {
        target.stamina.setCurrentLevel(0)
    }
    target.hp.setCurrentLevel(0)
    game.display.drawInfoPanel()
    
    if (target.hp.isEmpty()) {
        if (target.actorType != Bones.Enums.ActorType.HERO) {
            return killMonster(game, target, actor)
    
        } else {
            return killSquadMember(game, target, actor)
        }
    } else {
        
        return true
    }

}

function runEndOfGame(game: Bones.Engine.Game) {
    game.event_queue = []
    game.messages.addMessage("Congratulations: everyone is dead")
    game.messages.addMessage(`Your final score was ${game.mobs_slain}`)
    game.messages.addMessage(`Your final level was ${game.difficulty}`)
    game.messages.addMessage("Hit F5 to replay")
}
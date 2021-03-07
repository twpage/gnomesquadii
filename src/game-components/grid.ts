import { Coordinate } from "./coordinate"
import * as Bones from '../bones'

interface Dict<T> {
    [key: number]: T
}

export class GridOfEntities<T> {

    // things: Dict<ThingInterface> = {}
    entities: Dict<T> = {}
    
    clearAll () {
        this.entities = {}
    }
    
    clone() : GridOfEntities<T> {
        let new_GoT = new GridOfEntities<T>()
        new_GoT.entities = {...this.entities}
        return new_GoT
    }
    
    hasAt (xy: Coordinate) : boolean {
        var key = Bones.Utils.xyToKey(xy)
        
        if (key in this.entities) {
            return true
        } else { 
            return false
        }
    }
    
    getAt (xy: Coordinate) : T {
        if (this.hasAt(xy)) {
            var key = Bones.Utils.xyToKey(xy)
            return this.entities[key]
        } else {
            return null
        }
    }
    
    // setAt (xy: Coordinate, something: Thing) : boolean {
    setAt (xy: Coordinate, something: T) : boolean {
        if (this.hasAt(xy)) {
            return false
        } else {
            var key = Bones.Utils.xyToKey(xy)
            this.entities[key] = something
            
            // if its a Thing, set its location on the object as well 
            if (something instanceof Bones.Entities.Entity) {
                (something as any).location = xy
            } 

            // something["location"] = xy

            return true
        }
    }
    
    removeAt (xy: Coordinate) : boolean {
        // returns true if we removed something, false if not
        if (this.hasAt(xy)) {
            var key = Bones.Utils.xyToKey(xy)
            delete this.entities[key]
            return true
        } else {
            return false
        }
    }
    
    getAllCoordinates() : Array<Coordinate> {
        let xy: Coordinate
        let numberkey : number
        let coords : Array<Coordinate> = []
        
        for (let key in this.entities) {
            numberkey = parseInt(key)
            xy = Bones.Utils.keyToXY(numberkey)
            coords.push(xy)
        }
        
        return coords
    }
    
    getAllEntities() : Array<T> {
        let values : Array<T> = []
        for (let key in this.entities) {
            values.push(this.entities[key])
        }
        
        return values
    }

    getAllCoordinatesAndEntities() : Array<ICoordinateAndEntity<T>> {
        let xy: Coordinate
        let numberkey : number

        let items : Array<ICoordinateAndEntity<T>> = []
        for (let key in this.entities) {
            numberkey = parseInt(key)
            xy = Bones.Utils.keyToXY(numberkey)
            items.push({
                xy: xy,
                entity: this.entities[key]
            })
        }

        return items
    } 
}

interface ICoordinateAndEntity<T> {
    xy: Coordinate,
    entity: T
}
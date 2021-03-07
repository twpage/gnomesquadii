import { Directions } from "."

export class Coordinate {
    public x: number
    public y: number
    
    constructor (xx: number, yy: number) {
        this.x = xx
        this.y = yy
    }
    
    toString () {
        return `(${this.x}, ${this.y})`
    }
    
    clone () : Coordinate {
        return new Coordinate(this.x, this.y)
    }
    
    compare(other_xy: Coordinate) : boolean {
        return (this.x == other_xy.x) && (this.y == other_xy.y)
    }
    
    add (other_xy: Coordinate) : Coordinate {
        let xy = new Coordinate(this.x + other_xy.x, this.y + other_xy.y)
        return xy
    }
    
    subtract (other_xy: Coordinate) : Coordinate {
        let xy = new Coordinate(this.x - other_xy.x, this.y - other_xy.y)
        return xy
    }
    
    multiplyScalar (scalar_amount : number) : Coordinate {
        let xy = new Coordinate(this.x * scalar_amount, this.y * scalar_amount)
        return xy
    }

    toUnit () : Coordinate {
        let x_sign : number = (this.x == 0) ? 0 : (Math.abs(this.x) / this.x)
        let y_sign : number = (this.y == 0) ? 0 : (Math.abs(this.y) / this.y)
        let xy = new Coordinate(x_sign, y_sign)
        return xy
    }
    
    getAdjacent() : Array<Coordinate> {
        return [
            this.add(Directions.UP),
            this.add(Directions.DOWN),
            this.add(Directions.LEFT),
            this.add(Directions.RIGHT)
        ]
    }

    getDiagonals() : Array<Coordinate> {
        return [
            this.add(Directions.UP_LEFT),
            this.add(Directions.UP_RIGHT),
            this.add(Directions.DOWN_LEFT),
            this.add(Directions.DOWN_RIGHT)
        ]
    }
    
    getSurrounding() : Array<Coordinate> {
        return [
            this.add(Directions.UP),
            this.add(Directions.DOWN),
            this.add(Directions.LEFT),
            this.add(Directions.RIGHT),
            this.add(Directions.DOWN_LEFT),
            this.add(Directions.DOWN_RIGHT),
            this.add(Directions.UP_LEFT),
            this.add(Directions.UP_RIGHT),
        ]
    }

}
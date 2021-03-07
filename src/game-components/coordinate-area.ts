import { Coordinate } from "../bones"

export class CoordinateArea {
    private list_of_coords: Array<Coordinate>
    constructor(given_xy_list: Array<Coordinate> = []) {
        this.list_of_coords = []
        this.addCoordinates(given_xy_list)
    }
    size(): number {
        return this.list_of_coords.length
    }
    
    getCoordinates(): Array<Coordinate> {
        return this.list_of_coords
    }

    addCoordinate(add_xy: Coordinate) : boolean {
        // returns true if a new coord, false if already exists in the list
        if (this.hasCoordinate(add_xy)) {
            return false
        } else {
            this.list_of_coords.push(add_xy.clone())
            return true
        }
    }

    addCoordinates(xy_list: Array<Coordinate>) : boolean {
        let results = xy_list.map((xy) : boolean => {
            return this.addCoordinate(xy)
        })

        return results.every((was_new) : boolean => { return was_new })
    }

    findCoordinate(find_xy: Coordinate): number {
        return this.list_of_coords.findIndex((xy) : boolean => {
            return xy.compare(find_xy)
        })
    }

    hasCoordinate(has_xy: Coordinate) : boolean {
        return this.findCoordinate(has_xy) > -1
    }

    removeCoordinate(del_xy: Coordinate) : boolean {
        let idx = this.findCoordinate(del_xy)
        if (idx > -1) {
            this.list_of_coords.splice(idx, 1)
            return true
        } else {
            return false
        }
    }

    getUnion(other_area: CoordinateArea) : CoordinateArea {
        // return elements of A + B
        let combined_area = new CoordinateArea(this.list_of_coords)
        other_area.getCoordinates().forEach((xy) => {
            combined_area.addCoordinate(xy)
        })

        return combined_area
    }

    getDiff(other_area: CoordinateArea) : CoordinateArea {
        // return elements of A not in B
        let diff_area = new CoordinateArea()
        this.getCoordinates().forEach((xy) => {
            if (!(other_area.hasCoordinate(xy))) {
                diff_area.addCoordinate(xy)
            }
        })
        return diff_area
    }

    getSymmetricDiff(other_area: CoordinateArea) : CoordinateArea {
        // return elements of A not in B and B not in A
        
        let diff_a = this.getDiff(other_area)
        let diff_b = other_area.getDiff(this)
        return diff_a.getUnion(diff_b)
    }

    getCoordinatesExcept(exception_xy_list: Array<Coordinate>) : Array<Coordinate> {
        let other_area = new CoordinateArea(exception_xy_list)
        return this.getDiff(other_area).getCoordinates()
    }

    filter(filter_fn: ICoordinateAreaFilter) : CoordinateArea {
        return new CoordinateArea(this.list_of_coords.filter(filter_fn))
    }
}

interface ICoordinateAreaFilter {
    (xy: Coordinate): boolean
}
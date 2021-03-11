import { Coordinate } from "../bones"

function isInteger (value: number) : boolean {
    return typeof value === 'number' && 
        isFinite(value) && 
        Math.floor(value) === value
}

export function getLine(start_xy: Coordinate, end_xy: Coordinate) : Array<Coordinate> { 
    // uses bresenham's line algorithm

    if ((!(start_xy)) || (!(end_xy))) {
        console.error("invalid coords passed to getLineBetweenPoints")
    }

    let non_integer = [start_xy.x, start_xy.y, end_xy.x, end_xy.y].some((coord_value: number) => {
        return (!(isInteger(coord_value)))
    })

    if (non_integer) {
        console.error("non-integer coordinates passed in")
    }
        
    // Bresenham's line algorithm
    let x0 : number = start_xy.x
    let y0 : number = start_xy.y
    let x1 : number = end_xy.x
    let y1 : number = end_xy.y

    let dy = y1 - y0
    let dx = x1 - x0
    let t = 0.5
    let points_lst = [new Coordinate(x0, y0)]
    let m : number
    
    if (start_xy.compare(end_xy)) {
        return points_lst
    }
    
    if (Math.abs(dx) > Math.abs(dy)) {
        m = dy / (1.0 * dx)
        t += y0
        if (dx < 0) {
            dx = -1
        } else {
            dx = 1
        }
        
        m *= dx

        while (x0 != x1) {
            x0 += dx
            t += m
            // points_lst.push({x: x0, y: Math.floor(t)}) # Coordinates(x0, int(t)))
            points_lst.push(new Coordinate(x0, Math.floor(t)))
        }
    } else {
        m = dx / (1.0 * dy)
        t += x0
        
        // dy = if (dy < 0) then -1 else 1
        if (dy < 0) {
            dy = -1 
        } else {
            dy = 1
        }
        
        m *= dy
        
        while (y0 != y1) {
            y0 += dy
            t += m
            // points_lst.push({x: Math.floor(t), y: y0}) # Coordinates(int(t), y0))
            points_lst.push(new Coordinate(Math.floor(t), y0))
        }
    }
    
    return points_lst
}

export function getSquare(center_xy: Coordinate, size: number): Array<Coordinate> {
    let points : Array<Coordinate> = []

    if (size <= 0) {
        points.push(center_xy)
    } else {
        let top_y = center_xy.y - size
        let bottom_y = center_xy.y + size
        let left_x = center_xy.x - size
        let right_x = center_xy.x + size
        
        // top and bottom (include corners)
        for (let x = left_x; x <= right_x; x++) {
            points.push(new Coordinate(x, top_y))
            points.push(new Coordinate(x, bottom_y))
        }

        // left and right sides (exclude corners)
        for (let y = top_y + 1; y < bottom_y; y++) {
            points.push(new Coordinate(left_x, y))
            points.push(new Coordinate(right_x, y))
        }
    }

    return points
}

export function getCircle(center_xy : Coordinate, radius : number) : Coordinate[] {
    // Returns the points that make up the radius of a circle
    // http://en.wikipedia.org/wiki/Midpoint_circle_algorithm
    let x0 = center_xy.x
    let y0 = center_xy.y
    
    let point_lst = []
    
    let f = 1 - radius
    let ddF_x = 1
    let ddF_y = -2 * radius
    let x = 0
    let y = radius
    
    point_lst.push([x0, y0 + radius])
    point_lst.push([x0, y0 - radius])
    point_lst.push([x0 + radius, y0])
    point_lst.push([x0 - radius, y0])
    
    while (x < y) {
        if (f >= 0) {
            y -= 1
            ddF_y += 2
            f += ddF_y
        }
            
        x += 1
        ddF_x += 2
        f += ddF_x
        point_lst.push([x0 + x, y0 + y])
        point_lst.push([x0 - x, y0 + y])
        point_lst.push([x0 + x, y0 - y])
        point_lst.push([x0 - x, y0 - y])
        point_lst.push([x0 + y, y0 + x])
        point_lst.push([x0 - y, y0 + x])
        point_lst.push([x0 + y, y0 - x])
        point_lst.push([x0 - y, y0 - x])
    }
        
    let point_xy_lst = []
    point_lst.forEach((xy_arr, index, array) => {
        point_xy_lst.push(new Coordinate(xy_arr[0], xy_arr[1]))
    })

    return point_xy_lst
}
/*
 * Physics
 * =======
 */
class Vector2 {
    constructor(
        public x: number,
        public y: number
    ) {}

    public add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    public difference(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    public scale(n: number): Vector2 {
        return new Vector2(this.x * n, this.y * n);
    }

    public amplitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public static reflectX(point: Vector2, x: number) {
        return new Vector2(2 * x - point.x, point.y);
    }

    public static reflectY(point: Vector2, y: number) {
        return new Vector2(point.x, 2 * y - point.y);
    }
}

interface PhysicalObject {
    position: Vector2;
    width: number;
    height: number;
}

function isInside(obstruction: PhysicalObject, point: Vector2): boolean {
    var difference = obstruction.position.difference(point);
    return Math.abs(difference.x) < obstruction.width/2 && Math.abs(difference.y) < obstruction.height/2;
}
function isOverlap(o1: PhysicalObject, o2: PhysicalObject): boolean {
    var difference = o1.position.difference(o2.position);
    return Math.abs(difference.x) < o1.width/2 + o2.width/2 && Math.abs(difference.y) < o1.height/2 + o2.height/2;
}



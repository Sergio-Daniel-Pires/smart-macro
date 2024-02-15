import { Incremental } from "./Incremental";

type Direction = "UP" | "DOWN";

export class Scroll extends Incremental {
    x: number;
    y: number;
    direction: Direction;

    constructor(x: number, y: number, dx: number) {
        super(null);
        this.x = x;
        this.y = y;
        this.direction = this.getDirection(dx);
    }

    getDirection(dx: number): Direction {
        return dx === -1 ? "DOWN" : "UP";
    }

    equals(value: any): boolean {
        if (!(value instanceof Scroll)) {
            return false;
        }

        return this.direction === value.direction;
    }

    toXML(): any {
        let baseObject: any = {
            Scroll: {
                '@x': this.x,
                '@y': this.y,
                '@direction': this.direction
            }
        }

        return baseObject;
    }
}
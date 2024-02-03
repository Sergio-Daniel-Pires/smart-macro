import { Incremental } from "./Incremental";

type Direction = "UP" | "DOWN";

export class Scroll extends Incremental {
    x: number;
    y: number;
    direction: Direction;

    constructor(x: number, y: number, dx: number) {
        super();
        this.x = x;
        this.y = y;
        this.direction = this.getDirection(dx);
    }

    getDirection(dx: number): Direction {
        return dx === -1 ? "DOWN" : "UP";
    }

    equals(value: Scroll): boolean {
        return this.direction === value.direction;
    }

    toString(): string {
        return `SCROLL ${this.direction} (${this.x}, ${this.y}) ${this.times}x`;
    }
}
import { Incremental } from "./Incremental";

type Direction = "UP" | "DOWN";

export class Scroll extends Incremental {
    x: number;
    y: number;
    direction: Direction;

    constructor(lastActionTime: number, x: number, y: number, dx: number) {
        super(lastActionTime);
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

    toXML(): any {
        let baseObject: any = {
            Scroll: {
                '@times': this.times,
                '@x': this.x,
                '@y': this.y,
                '@direction': this.direction
            }
        }

        if (this.delay) {
            baseObject.Scroll['@delay'] = this.delay;
        }

        return baseObject;
    }
}
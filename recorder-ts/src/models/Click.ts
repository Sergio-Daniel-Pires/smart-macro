import { Incremental } from "./Incremental";

export class Click extends Incremental {
    x: number;
    y: number;
    button: string;

    constructor(x: number, y: number, button: string) {
        super();
        this.x = x;
        this.y = y;
        this.button = button;
    }

    equals(value: Click): boolean {
        return this.x === value.x && this.y === value.y && this.button === value.button;
    }

    toString(): string {
        return `'${this.button}' (${this.x}, ${this.y}) ${this.times}x`;
    }
}
import { Incremental } from "./Incremental";

export class Click extends Incremental {
    x: number;
    y: number;
    button: string;

    constructor(lastActionTime: number, x: number, y: number, button: string) {
        super(lastActionTime);
        this.x = x;
        this.y = y;
        this.button = button;
    }

    equals(value: Click): boolean {
        return (
            this.delay == value.delay && this.x === value.x &&
            this.y === value.y && this.button === value.button
        );
    }

    toString(): string {
        return `'${this.button}' (${this.x}, ${this.y}) ${this.times}x`;
    }

    toXML(): any {
        let baseObject: any = {
            Click: {
                '@times': this.times,
                '@x': this.x,
                '@y': this.y,
                '@button': this.button,
            }
        }

        if (this.delay) {
            baseObject.Click['@delay'] = this.delay;
        }

        return baseObject;
    }
}
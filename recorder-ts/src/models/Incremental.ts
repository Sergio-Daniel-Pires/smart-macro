export abstract class Incremental {
    times: number;
    pressed: number
    releaseIn: number;

    constructor() {
        this.times = 1;
        this.pressed = Date.now();
    }

    increment(): void {
        this.times += 1;
    }

    release(): void {
        this.releaseIn = Date.now() - this.pressed;
    }

    abstract equals(value: Incremental): boolean;
    abstract toXML(): string;
}

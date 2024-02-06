export abstract class Incremental {
    times: number;
    delay: number;

    constructor(lastActionTime: number) {
        this.times = 1;
        this.delay = Date.now() - lastActionTime;
    }

    increment(): void {
        this.times += 1;
    }

    abstract equals(value: Incremental): boolean;
    abstract toXML(): string;
}

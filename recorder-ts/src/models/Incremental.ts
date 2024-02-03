export abstract class Incremental {
    times: number;

    constructor() {
        this.times = 1;
    }

    increment(): void {
        this.times += 1;
    }

    abstract equals(value: Incremental): boolean;
}

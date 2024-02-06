export class WaitForTime {
    timeToWait: number

    constructor(timeToWait: number) {
        this.timeToWait = timeToWait;
    }

    equals(value: WaitForTime): boolean {
        return this.timeToWait == value.timeToWait;
    }

    toString(): string {
        return `wait for ${this.timeToWait}`;
    }

    toXML(): any {
        return {
            WaitFor: {
                "@type": "time",
                "@milliseconds": this.timeToWait
            }
        }
    }
}
import { Incremental } from "./Incremental";

export class KeyStroke extends Incremental {
    button: number;

    constructor(button: number) {
        super();
        this.button = button;
    }

    equals(value: any): boolean {
        if (!(value instanceof KeyStroke)) {
            return false;
        }

        return this.button === value.button;
    }

    toString(): string {
        return `${this.button}`;
    }

    toXML(): any {
        let baseObject: any = {
            KeyStroke: {
                '@button': this.button,
                '@released': this.releaseIn
            }
        }

        return baseObject;
    }
}

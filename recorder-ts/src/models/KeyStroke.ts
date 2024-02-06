import { Incremental } from "./Incremental";

export class KeyStroke extends Incremental {
    button: string;

    constructor(lastActionTime: number, button: string) {
        super(lastActionTime);
        this.button = button;
    }

    equals(value: KeyStroke): boolean {
        return this.button === value.button;
    }

    toString(): string {
        return `${this.button}`;
    }

    toXML(): any {
        let baseObject: any = {
            KeyStroke: {
                '@button': this.button
            }
        }

        if (this.delay) {
            baseObject.KeyStroke['@delay'] = this.delay;
        }

        return baseObject;
    }
}

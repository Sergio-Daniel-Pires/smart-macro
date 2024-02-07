import { Incremental } from "./Incremental";
import { SpecialKeyStroke } from "./SpecialKeyStroke";

export class KeyStroke extends Incremental {
    button: number;

    constructor(button: number) {
        super();
        this.button = button;
    }

    equals(value: KeyStroke | SpecialKeyStroke): boolean {
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

        return baseObject;
    }
}

import { Incremental } from "./Incremental";

export class KeyStroke extends Incremental {
    button: string;

    constructor(button: string) {
        super();
        this.button = button;
    }

    equals(value: KeyStroke): boolean {
        return this.button === value.button;
    }

    toString(): string {
        return `${this.button}`;
    }
}

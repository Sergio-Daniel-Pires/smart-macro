import { KeyStroke } from "./KeyStroke";

export class SpecialKeyStroke extends KeyStroke {
    constructor(button: string) {
        super(button.replace("Key.", ""));
    }

    toString(): string {
        return `'${this.button}' ${this.times}x`;
    }
}
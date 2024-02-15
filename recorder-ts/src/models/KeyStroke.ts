import { Incremental, KeyAction } from "./Incremental";

export class KeyStroke extends Incremental {
    button: number;

    constructor(button: number, keyAction: KeyAction) {
        super(keyAction);
        this.button = button;
    }

    equals(value: any): boolean {
        if (!(value instanceof KeyStroke)) {
            return false;
        }

        return this.button === value.button;
    }

    toXML(): any {
        let baseObject: any = {
            KeyStroke: {
                '@button': this.button,
                '@action': this.keyAction
            }
        }

        return baseObject;
    }
}

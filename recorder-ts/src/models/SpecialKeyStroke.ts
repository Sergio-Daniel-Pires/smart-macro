import { KeyAction } from "./Incremental";
import { KeyStroke } from "./KeyStroke";

export enum SpecialEnum {
    Backspace = 8,
    Enter = 13,
    CapsLock = 20,
    Escape = 27,
    PrintScreen = 44,
    F1 = 112,
    F2 = 113,
    F3 = 114,
    F4 = 115,
    F5 = 116,
    F6 = 117,
    F7 = 118,
    F8 = 119,
    F9 = 120,
    F10 = 121,
    F11 = 122,
    F12 = 123,
    NumLock = 144
}

export enum ControlEnum {
    LeftShift = 160,
    RightShift = 161,
    LeftControl = 162,
    RightControl = 163,
    LeftAlt = 164,
    RightAlt = 165,
}

export class SpecialKeyStroke extends KeyStroke {
    name: string

    constructor(event: any, keyAction: KeyAction) {
        let button: number = event.rawcode
        super(button, keyAction);

        if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
            this.name = ControlEnum[button as ControlEnum]
        } else {
            this.name = SpecialEnum[button as SpecialEnum];
        }
    }

    equals(value: any): boolean {
        if (!(value instanceof KeyStroke)) {
            return false;
        }

        return this.button === value.button;
    }

    toXML(): any {
        let baseObject: any = {
            SpecialKeyStroke: {
                '@button': this.button,
                '@name': this.name,
                '@action': this.keyAction
            }
        }

        return baseObject;
    }
}
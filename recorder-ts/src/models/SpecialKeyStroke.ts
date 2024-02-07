import { KeyStroke } from "./KeyStroke";

enum SpecialEnum {
    backspace = 8,
    capslock = 20,
    esc = 27,
    printscreen = 44,
    f1 = 112,
    f2 = 113,
    f3 = 114,
    f4 = 115,
    f5 = 116,
    f6 = 117,
    f7 = 118,
    f8 = 119,
    f9 = 120,
    f10 = 121,
    f11 = 122,
    f12 = 123,
    numlock = 144
}

enum ControlEnum {
    l_shift = 160,
    r_shift = 161,
    l_ctrl = 162,
    r_ctrl = 163,
    l_alt = 164,
    r_alt = 165,
}

export class SpecialKeyStroke extends KeyStroke {
    name: string

    constructor(event: any) {
        let button: number = event.rawcode
        super(button);

        if (event.shiftKey) { this.name = "shift" }
        else if (event.ctrlKey) { this.name = "ctrl" }
        else if (event.altKey) { this.name = "alt" }
        else if (event.metaKey) { this.name = "meta" }
        else {
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
                '@released': this.releaseIn
            }
        }

        return baseObject;
    }
}
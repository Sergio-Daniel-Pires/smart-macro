import { KeyStroke } from "./KeyStroke";

enum KeyEnum {
    esc = 27,
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
            this.name = KeyEnum[button as KeyEnum];
        }
    }

    equals(value: KeyStroke | SpecialKeyStroke): boolean {
        return this.button === value.button;
    }

    toXML(): any {
        let baseObject: any = {
            SpecialKeyStroke: {
                '@times': this.times,
                '@button': this.button,
                '@test': this.name
            }
        }

        return baseObject;
    }
}
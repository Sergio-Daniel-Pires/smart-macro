import { KeyStroke } from "./KeyStroke";

enum KeyEnum {
    shift = 16,
    ctrl = 17,
    alt = 18,
    esc = 27,
}

export class SpecialKeyStroke extends KeyStroke {
    constructor(lastActionTime: number, button: number) {
        super(lastActionTime, button);
    }

    toString(): string {
        return `'${this.button}' ${this.times}x`;
    }

    equals(value: KeyStroke | SpecialKeyStroke): boolean {
        return this.button === value.button;
    }

    toXML(): any {
        let baseObject: any = {
            SpecialKeyStroke: {
                '@times': this.times,
                '@button': this.button
            }
        }

        if (this.delay) {
            baseObject.SpecialKeyStroke['@delay'] = this.delay;
        }

        return baseObject;
    }
}
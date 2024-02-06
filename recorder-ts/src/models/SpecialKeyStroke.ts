import { KeyStroke } from "./KeyStroke";

export class SpecialKeyStroke extends KeyStroke {
    constructor(lastActionTime: number, button: number) {
        super(lastActionTime, button);
    }

    toString(): string {
        return `'${this.button}' ${this.times}x`;
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
import { KeyStroke } from "./KeyStroke";

export class KeyWord {
    word: Array<number>
    delay: Array<number>

    constructor(keyStroke: KeyStroke) {
        this.word = [keyStroke.button];
        this.delay = [keyStroke.delay];
    }

    equals(value: KeyWord): boolean {
        return this.word === value.word;
    }

    toString(): string {
        return `${this.word}`;
    }

    newChar(keyStroke: KeyStroke): void {
        this.word.push(keyStroke.button);
        this.delay.push(keyStroke.delay);
    }

    toXML(): any {
        let baseObject: any = {
            KeyWord: {
                '#text': [],
                '@avgDelay': this.delay.reduce((a, b) => a+b, 0) / this.word.length
            }
        }

        this.word.forEach((char) =>{
            baseObject.KeyWord['#text'].push(String.fromCharCode(char));
        })

        return baseObject;
    }
}

import { KeyStroke } from "./KeyStroke";

export class KeyWord {
    word: Array<number>

    constructor(keyStroke: KeyStroke) {
        this.word = [keyStroke.button];
    }

    equals(value: KeyWord): boolean {
        return this.word === value.word;
    }

    toString(): string {
        return `${this.word}`;
    }

    newChar(keyStroke: KeyStroke): void {
        this.word.push(keyStroke.button);
    }

    toXML(): any {
        let baseObject: any = {
            KeyWord: {
                '#text': [],
            }
        }

        this.word.forEach((char) =>{
            baseObject.KeyWord['#text'].push(String.fromCharCode(char));
        })

        return baseObject;
    }
}

import { KeyStroke } from "./KeyStroke";

export class KeyWord {
    word: Array<string>
    delay: Array<number>

    constructor(word: string) {
        this.word = [word];
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
                '#text': this.word,
                '@avgDelay': this.delay.reduce((a, b) => a+b, 0) / this.word.length
            }
        }

        return baseObject;
    }
}

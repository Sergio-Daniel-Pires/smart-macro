import { Incremental, KeyAction } from "./Incremental";

export class Click extends Incremental {
    x: number;
    y: number;
    button: string;

    constructor(x: number, y: number, button: string, keyAction: KeyAction) {
        super(keyAction);
        this.x = x;
        this.y = y;
        this.button = button;
    }

    equals(value: any): boolean {
        if (!(value instanceof Click)) {
            return false;
        }

        return (
            this.x === value.x && this.y === value.y && this.button === value.button
        );
    }

    toXML(): any {
        let baseObject: any = {
            Click: {
                '@button': this.button,
                '@x': this.x,
                '@y': this.y,
                '@action': this.keyAction
            }
        }

        return baseObject;
    }
}
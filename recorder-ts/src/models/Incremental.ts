import { Actions } from "./Actions";

export type KeyAction = "press" | "release" | "full"

export abstract class Incremental {
    pressed: number
    keyAction: KeyAction
    delay: number

    constructor(keyAction: KeyAction) {
        this.pressed = Date.now();
        this.keyAction = keyAction;

        // Only has delay if was pressed and released in sequence
        this.delay = null;
    }

    release (): void {
        this.delay = Date.now() - this.pressed;
        this.keyAction = "full";
    }

    abstract equals(value: Incremental | Actions): boolean;
    abstract toXML(): string;
}

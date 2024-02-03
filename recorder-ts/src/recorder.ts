import * as iohook from 'iohook';
import { KeyStroke, SpecialKeyStroke, Click, Scroll, Groupable } from './models';

const START = 0;
const END = 1;
const TOGGLE_RECORD = 'your_toggle_record_key';

export class RecordMacro {
    s_width: number;
    s_height: number;
    recording: boolean;
    macro: Array<number | Groupable>;

    constructor() {
        // const screenSize = robot.getScreenSize();
        // this.s_width = screenSize.width;
        // this.s_height = screenSize.height;
        this.recording = true;
        this.macro = [START];

        iohook.on('mouseup', (event) => this.onMouseClick(event));
        iohook.on('mousewheel', (event) => this.onMouseScroll(event));
        iohook.on('keydown', (event) => this.onKeyPress(event));
        iohook.on('keyup', (event) => this.onKeyRelease(event));
        iohook.start();
    }

    addNew(newObj: KeyStroke | SpecialKeyStroke | Click | Scroll): boolean {
        if (!this.recording) {
            return false;
        }

        const lastItem = this.macro[this.macro.length - 1];
        if (
            this.macro.length === 1 || !(lastItem instanceof Groupable &&
            lastItem.groupType === newObj.constructor)
        ){
            this.macro.push(new Groupable(newObj));
        } else {
            lastItem.addNew(newObj);
        }

        return true;
    }

    onMouseClick(event: any): void {
        console.log(event);
        if (this.recording) {
            const click = new Click(event.x, event.y, event.button);
            this.addNew(click);
        }
    }

    onMouseScroll(event: any): void {
        console.log(event);
        if (this.recording) {
            const scroll = new Scroll(event.x, event.y, event.amount);
            this.addNew(scroll);
        }
    }

    onKeyPress(event: any): void {
        console.log(event);
        if (this.recording) {
            const keyStroke = new KeyStroke(event.rawcode);
            this.addNew(keyStroke);

            if (keyStroke.button === TOGGLE_RECORD) {
                this.toggleRecord();
            }
        }
    }

    onKeyRelease(event: any): void {
        console.log(event);
        if (event.rawcode === "ESC") {
            iohook.stop();
        }
    }

    toggleRecord(): void {
        this.recording = !this.recording;
        console.log(`Gravação de macro: ${this.recording ? 'LIGADA' : 'DESLIGADA'}`);
    }

    export(): void {
        this.macro.push(END);
        console.log(this.macro.map((item, idx) => `${idx}. ${item.toString()}`).join('\n'));
    }

    start(): void {
        console.log('Iniciando gravação de macro...');
    }
}

function main(args: string[]): void {
    const macroRecorder = new RecordMacro();
    macroRecorder.start();
    // O restante da lógica para controlar quando parar a gravação e exportar a macro
}

main(process.argv.slice(2));

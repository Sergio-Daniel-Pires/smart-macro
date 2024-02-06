import * as iohook from 'iohook';
import {
    KeyStroke, SpecialKeyStroke, Click, Scroll, Groupable, WaitForTime, Actions
} from './models';
import * as fs from 'fs';
import * as xmlbuilder from 'xmlbuilder';
import { createOverlayWindow } from "./overlay";
import { BrowserWindow } from 'electron';

const START_RECORD = 112;
const STOP_RECORD = 27;
const TOGGLE_RECORD = 119;

export class RecordMacro {
    s_width: number;
    s_height: number;
    recording: boolean;
    macro: Array<Groupable>;
    lastActionTime: number;

    constructor() {
        // const screenSize = robot.getScreenSize();
        // this.s_width = screenSize.width;
        // this.s_height = screenSize.height;
        this.recording = true;
        this.macro = [ new Groupable(new Actions("START")) ];
        this.lastActionTime = Date.now();

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

        let lastItem = this.macro[this.macro.length - 1];
        if (lastItem.items.length && lastItem.items[0].constructor !== newObj.constructor) {
            this.macro.push(new Groupable());
            lastItem = this.macro[this.macro.length - 1];
        }

        // Saves time between actions
        // Use delay for < 1s or wait for time for > 1s
        let waitFor = null;
        if (newObj.delay > 1000) {
            waitFor = new WaitForTime(newObj.delay);
            newObj.delay = null;
        }

        this.lastActionTime = Date.now();
        lastItem.addNew(newObj);

        if (waitFor) {
            lastItem.addNew(waitFor)
        }

        return true;
    }

    onMouseClick(event: any): void {
        if (this.recording) {
            const click = new Click(this.lastActionTime, event.x, event.y, event.button);
            this.addNew(click);
        }
    }

    onMouseScroll(event: any): void {
        if (this.recording) {
            const scroll = new Scroll(this.lastActionTime, event.x, event.y, event.amount);
            this.addNew(scroll);
        }
    }

    onKeyPress(event: any): void {
        if (this.recording) {
            const keyStroke = new KeyStroke(this.lastActionTime, event.rawcode);
            this.addNew(keyStroke);
        }
    }

    onKeyRelease(event: any): void {
        if (event.rawcode === START_RECORD) {
            this.startRecording();
        } else if (event.rawcode === STOP_RECORD) {
            this.stopRecording();
        } else if (event.rawcode === TOGGLE_RECORD) {
            this.toggleRecord();
        }
    }

    toggleRecord(): void {
        this.recording = !this.recording;
        console.log(`Gravação de macro: ${this.recording ? 'LIGADA' : 'DESLIGADA'}`);
    }

    stopRecording(): void {
        if (this.recording){
            console.log("Stopping recording...")
            this.recording = false;

            this.macro.push(new Groupable(new Actions("END")));
            iohook.stop();
            this.export();
        }
    }

    startRecording(): void {
        // if (this.recording) {
            console.log("Starting recording...");
            this.recording = true;

            const overlayWindow: BrowserWindow = createOverlayWindow();
            overlayWindow.show();
        // }
    }

    export(): void {
        const xmlDoc = xmlbuilder.create('Macro');

        this.macro.forEach((group) => {
            let groupable = xmlDoc.element("Groupable")

            let items = group.collapseList();
            items.forEach((step) => {
                groupable.element(step.toXML());
            })
        });

        const xmlString = xmlDoc.end({ pretty: true });
        fs.writeFileSync('macro.xml', xmlString, 'utf-8');
    }
}

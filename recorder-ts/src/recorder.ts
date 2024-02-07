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
    macro: Array<Groupable>;
    lastObj: KeyStroke | SpecialKeyStroke | Click | Scroll
    lastActionTime: number;
    recording: boolean;
    started: boolean;

    overlayWindow: BrowserWindow;

    constructor() {
        // const screenSize = robot.getScreenSize();
        // this.s_width = screenSize.width;
        // this.s_height = screenSize.height;

        this.resetVars();
        // External children
        this.overlayWindow = createOverlayWindow();

        // Hooks
        iohook.on('mouseup', (event) => this.onMouseClick(event));
        iohook.on('mousewheel', (event) => this.onMouseScroll(event));
        iohook.on('keydown', (event) => this.onKeyPress(event));
        iohook.on('keyup', (event) => this.onKeyRelease(event)); // Removed to use only keypress
        iohook.start();
    }

    resetVars(): void {
        this.macro = [ new Groupable(new Actions("START")) ];
        this.lastActionTime = null;
        this.started = false;
        this.recording = false;

        this.lastObj = null;
    }

    addNew(newObj: KeyStroke | SpecialKeyStroke | Click | Scroll): boolean {
        if (!this.recording) {
            return false;
        }

        // Create a new group if the new object are different from last
        // and holdings are different
        let lastGroup = this.macro[this.macro.length - 1];
        if (lastGroup.items.length && lastGroup.items[0].constructor !== newObj.constructor) {
            this.macro.push(new Groupable());
            lastGroup = this.macro[this.macro.length - 1];
        }

        this.lastActionTime = Date.now();
        lastGroup.addNew(newObj);
        this.lastObj = newObj;

        return true;
    }

    onKeyRelease(newObj: KeyStroke | SpecialKeyStroke): void {
        // Update last button releaseIn or insert new holding group
        if (newObj === this.lastObj) {
            this.lastObj.release();
        } else {
            let holding = this.macro[this.macro.length - 1].holding
            let isHolding = holding.indexOf(newObj)

            if (isHolding) {
                delete holding[isHolding];
            } else {
                holding
            }

            this.macro.push(new Groupable(null, holding));
        }
    }

    onMouseClick(event: any): void {
        // Record mouse Click
        if (this.recording) {
            const click = new Click(event.x, event.y, event.button);
            this.addNew(click);
        }
    }

    onMouseScroll(event: any): void {
        // Record mouse Scroll
        if (this.recording) {
            const scroll = new Scroll(event.x, event.y, event.amount);
            this.addNew(scroll);
        }
    }

    onKeyPress(event: any): void {
        // Manage user inputs
        console.log(event.rawcode);

        if (event.rawcode === START_RECORD) {
            this.startRecording();
            return;
        } else if (event.rawcode === STOP_RECORD) {
            this.stopRecording();
            return;
        } else if (event.rawcode === TOGGLE_RECORD) {
            this.togglePauseRecord();
            return;
        }

        if (this.recording) {
            let keyStroke: KeyStroke | SpecialKeyStroke;

            if (
                (event.rawcode >= 65 && event <= 90) || // A-Z
                (event.rawcode == 32)
            ) {
                keyStroke = new KeyStroke(event.rawcode);
            } else {
                keyStroke = new SpecialKeyStroke(event);
            }

            this.addNew(keyStroke);
        }
    }

    toggleRecordBool(newValue?: boolean): void {
        // Toggle record boolean for this file and others
        if (!newValue) {
            newValue = !this.recording
        }

        this.recording = newValue;
        // IPC Send to Child
        this.overlayWindow.webContents.send('recording-state-changed', newValue);
    }

    togglePauseRecord(): void {
        this.toggleRecordBool();
        console.log(`Macro Recording: ${this.recording ? 'ON' : 'OFF'}`);
    }

    stopRecording(): void {
        if (this.started) {
            // Stop IOHook
            console.log("Stopping recording...")
            this.toggleRecordBool(false);
            this.started = false;

            // Hide Overlay
            this.overlayWindow.hide();

            // Add END to list and export to XML
            this.macro.push(new Groupable(new Actions("END")));
            this.export();

            // Reset macro
            this.resetVars();
        }
    }

    startRecording(): void {
        if (!this.recording && !this.started) {
            console.log("Starting recording...");
            this.toggleRecordBool(true);
            this.started = true;

            // Show Overlay
            this.overlayWindow.show();
        }
    }

    export(): void {
        // Export last macro to XML
        const xmlDoc = xmlbuilder.create('Macro');

        this.macro.forEach((group) => {
            let groupable = xmlDoc.element("Groupable")

            // Create list to items that are holding
            let holding = group.holding;
            if (holding.length) {
                let holdingGroup = groupable.element("Holding");

                group.holding.forEach((holding) => {
                    holdingGroup.element(holding.toXML());
                })
            }

            // Add Keystrokes Step-By-Step
            let steps = groupable.element("Steps");
            group.collapseList().forEach((step) => {
                steps.element(step.toXML());
            })
        });

        const xmlString = xmlDoc.end({ pretty: true });
        fs.writeFileSync('macro.xml', xmlString, 'utf-8');
    }
}

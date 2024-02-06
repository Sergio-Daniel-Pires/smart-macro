import * as iohook from 'iohook';
import {
    KeyStroke, SpecialKeyStroke, Click, Scroll, Groupable, WaitForTime, Actions
} from './models';
import * as fs from 'fs';
import * as xmlbuilder from 'xmlbuilder';
import { createOverlayWindow } from "./overlay";
import { BrowserWindow } from 'electron';
import Store = require('electron-store');

const START_RECORD = 112;
const STOP_RECORD = 27;
const TOGGLE_RECORD = 119;

export class RecordMacro {
    s_width: number;
    s_height: number;
    macro: Array<Groupable>;
    lastActionTime: number;
    recording: boolean;

    overlayWindow: BrowserWindow;

    constructor() {
        // const screenSize = robot.getScreenSize();
        // this.s_width = screenSize.width;
        // this.s_height = screenSize.height;
        this.macro = [ new Groupable(new Actions("START")) ];
        this.lastActionTime = Date.now();
        this.recording = false;

        // External children
        this.overlayWindow = createOverlayWindow();

        // Hooks
        iohook.on('mouseup', (event) => this.onMouseClick(event));
        iohook.on('mousewheel', (event) => this.onMouseScroll(event));
        iohook.on('keydown', (event) => this.onKeyPress(event));
        //iohook.on('keyup', (event) => this.onKeyRelease(event)); Removed to use only keypress
        iohook.start();
    }

    addNew(newObj: KeyStroke | SpecialKeyStroke | Click | Scroll): boolean {
        if (!this.recording) {
            return false;
        }

        // Create a new group if the new object are different from last
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

        // Add new object and register last action time if needed
        this.lastActionTime = Date.now();
        lastItem.addNew(newObj);

        if (waitFor) {
            lastItem.addNew(waitFor)
        }

        return true;
    }

    onMouseClick(event: any): void {
        // Record mouse Click
        if (this.recording) {
            const click = new Click(this.lastActionTime, event.x, event.y, event.button);
            this.addNew(click);
        }
    }

    onMouseScroll(event: any): void {
        // Record mouse Scroll
        if (this.recording) {
            const scroll = new Scroll(this.lastActionTime, event.x, event.y, event.amount);
            this.addNew(scroll);
        }
    }

    onKeyPress(event: any): void {
        // Manage user inputs
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
            const keyStroke = new KeyStroke(this.lastActionTime, event.rawcode);
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
        if (this.recording){
            // Stop IOHook
            console.log("Stopping recording...")
            this.toggleRecordBool(false);

            // Hide Overlay
            this.overlayWindow.hide();

            // Add END to list and export to XML
            this.macro.push(new Groupable(new Actions("END")));
            this.export();
        }
    }

    startRecording(): void {
        if (!this.recording) {
            console.log("Starting recording...");
            this.toggleRecordBool(true);

            // Show Overlay
            this.overlayWindow.show();
        }
    }

    export(): void {
        // Export last macro to XML
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

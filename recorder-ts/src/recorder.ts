import * as iohook from 'iohook';
import {
    KeyStroke, SpecialKeyStroke, Click, Scroll, Actions, Incremental
} from './models';
import * as fs from 'fs';
import * as xmlbuilder from 'xmlbuilder';
import { createOverlayWindow } from "./overlay";
import { BrowserWindow } from 'electron';
import { Holding } from './models/Holding';
import { keyboard, Key } from "@nut-tree/nut-js";
import * as xml2js from "xml2js";

const START_RECORD = 112;
const RUN_RECORD = 114;
const STOP_RECORD = 27;
const TOGGLE_RECORD = 119;

export class RecordMacro {
    macro: Holding;
    parent: Holding;
    recording: boolean;
    started: boolean;
    lastActionTime: number

    overlayWindow: BrowserWindow;

    constructor() {
        // Initializate macro vars
        this.resetVars();

        // External children
        this.overlayWindow = createOverlayWindow();

        // Hooks
        iohook.on('mousedown', (event) => this.onMouseClick(event));
        iohook.on('mouseup', (event) => this.onMouseClick(event));

        iohook.on('mousewheel', (event) => this.onMouseScroll(event));

        iohook.on('keydown', (event) => this.onKeyPress(event));
        iohook.on('keyup', (event) => this.onKeyRelease(event));
        iohook.start();
    }

    resetVars(): void {
        // Set parent as macro
        this.macro = new Holding(null, new Actions("START"))
        this.parent = this.macro;

        this.started = false;
        this.recording = false;
        this.lastActionTime = null;
    }

    addNew (newObj: Incremental): void {
        var lastItem = this.parent.getLast();

        if (lastItem instanceof Incremental && newObj.equals(lastItem) && lastItem.keyAction === "press") {
            lastItem.release();
        } else if (
            lastItem instanceof Actions ||
            (lastItem.keyAction !== "press" && newObj.keyAction === "press")
        ){
            this.parent.addNew(newObj);
        } else if (lastItem.keyAction === "press") {
            var newHolding = new Holding(this.parent, newObj)
            this.parent.addNew(newHolding);
            this.parent = newHolding;
        } else {
            this.parent = this.parent.parent;
            this.parent.addNew(newObj);
        }

        this.lastActionTime = Date.now();
    }

    onKeyPress(event: any): void {
        // Manage user inputs
        // Para parar precisa ser na entrada da tecla, se n ele captura tmb
        // Pausa aqui para não pegar o TOGGLE_RECODE.keyUp
        if (event.rawcode === STOP_RECORD) {
            this.stopRecording();
            return;
        } else if (event.rawcode === TOGGLE_RECORD) {
            this.togglePauseRecord();
            return;
        } else if (event.rawcode === RUN_RECORD) {
            const xml = fs.readFileSync('macro.xml', 'utf8');
            xml2js.parseString(xml, { explicitChildren: true, preserveChildrenOrder: true }, (err, result) => {
                if (err) {
                    console.error('Erro ao parsear XML:', err);
                    return;
                }

                function createArrayFromObject(obj: any): void {
                    const steps = obj.Macro.Steps[0].$$;
                    steps.forEach((step: any) => {
                        console.log(step)
                    })
                }

                createArrayFromObject(result);
            });
        }

        if (!this.recording) {
            return;
        }

        let keyStroke: KeyStroke | SpecialKeyStroke = this.eventToKeyStroke(event, 'press');
        this.addNew(keyStroke);
    }

    onKeyRelease(event: any): void {
        // Para iniciar precisa ser na saida da tecla, se não ele pega ela voltando
        // Pausa aqui para não pegar o TOGGLE_RECODE.keyDown
        if (event.rawcode === START_RECORD) {
            this.startRecording();
            return;
        } else if (event.rawcode === TOGGLE_RECORD) {
            return;
        }

        if (!this.recording) {
            return;
        }

        let keyStroke: KeyStroke | SpecialKeyStroke = this.eventToKeyStroke(event, 'release');
        this.addNew(keyStroke)
    }

    onMouseClick(event: any): void {
        let eventType: "press" | "release";

        // Record mouse Click
        if (!this.recording) {
            return;
        }

        if (event.type === 'mousedown') {
            eventType = 'press'
        } else {
            eventType = 'release'
        }

        const newClick = new Click(event.x, event.y, event.button, eventType);

        this.addNew(newClick);
    }

    onMouseScroll(event: any): void {
        // Record mouse Scroll
        if (!this.recording) {
            return;
        }

        const mouseScroll = new Scroll(event.x, event.y, event.amount);

        this.addNew(mouseScroll);
    }

    eventToKeyStroke(event: any, eventType: 'press' | 'release'): KeyStroke | SpecialKeyStroke {
        if (
            (event.rawcode >= 65 && event.rawcode <= 90) || // a-z
            (event.rawcode == 32) ||                        // Space
            (event.rawcode >= 48 && event.rawcode <= 57)    // Numbers 0-9
        ) {
            return new KeyStroke(event.rawcode, eventType);
        }

        return new SpecialKeyStroke(event, eventType);
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
        if (this.started) {
            this.toggleRecordBool();
            console.log(`Macro Recording: ${this.recording ? 'ON' : 'OFF'}`);
        }
    }

    stopRecording(): void {
        if (this.started) {
            // Stop IOHook
            console.log("Stopping recording...")
            this.toggleRecordBool(false);
            this.started = false;

            // Hide Overlay
            this.overlayWindow.hide();

            // export to XML
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

        const steps = xmlDoc.element("Steps");
        this.macro.addHolding(steps);

        const xmlString = xmlDoc.end({ pretty: true });
        fs.writeFileSync('macro.xml', xmlString, 'utf-8');
    }
}

async function executeActions(steps: any) {
    for (const step of steps) {
        let keyCode;

        console.log(step);
        if (step.SpecialKeyStroke) {
            keyCode = parseInt(Key[step.SpecialKeyStroke.$.name]);

            if (step.SpecialKeyStroke.$.action === 'full') {
                await keyboard.pressKey(keyCode);
                await keyboard.releaseKey(keyCode);
            } else if (step.SpecialKeyStroke.$.action === 'press') {
                await keyboard.pressKey(keyCode);
            } else if (step.SpecialKeyStroke.$.action === 'release') {
                await keyboard.releaseKey(keyCode);
            }
        } else if (step.KeyStroke) {
            let keyCode = step.KeyStroke.$.button

            if (step.KeyStroke.$.action === 'full') {
                await keyboard.type(keyCode);
            }
        }
        if (step.Holding) {
            await executeActions(step.Holding);
        }
    }
}


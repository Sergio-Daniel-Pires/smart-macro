import * as iohook from 'iohook';
import {
    KeyStroke, SpecialKeyStroke, Click, Scroll, Groupable, WaitForTime, Actions, Incremental
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
    lastObj: Incremental
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
        //iohook.on('mouseup', (event) => this.onMouseClick(event));
        //iohook.on('mousewheel', (event) => this.onMouseScroll(event));
        iohook.on('keydown', (event) => this.onKeyPress(event));
        iohook.on('keyup', (event) => this.onKeyRelease(event));
        iohook.start();
    }

    resetVars(): void {
        this.macro = [ new Groupable(new Actions("START")) ];
        this.lastObj = null;
        this.lastActionTime = null;
        this.started = false;
        this.recording = false;

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
        }

        if (!this.recording) {
            return;
        }

        let keyStroke: KeyStroke | SpecialKeyStroke = this.eventToKeyStroke(event);

        // Se ja existir um ultimo objeto, cria um holding
        if (this.lastObj) {
            var holding = this.macro[this.macro.length - 1].holding.slice(); // Slice copia a lista
            holding.push(this.lastObj);
            this.macro.push(new Groupable(null, holding));
        }

        this.lastObj = keyStroke;
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

        // Update last button releaseIn or insert new holding group
        let newKey: KeyStroke | SpecialKeyStroke = this.eventToKeyStroke(event);
        let lastGroup = this.macro[this.macro.length - 1];
        var holding = lastGroup.holding.slice();

        // Da apenas release se o ultimo apertado for o ultimo solto
        // Se nao for, adiciona waitFor e cria novo grupo
        if (newKey.equals(this.lastObj)) {
            // Verifica se precisa de novo Group
            if (lastGroup.groupType && !(newKey.constructor.name === lastGroup.groupType)) {
                this.macro.push(new Groupable(null, holding));
            }

            this.lastObj.release()
            this.macro[this.macro.length - 1].addNew(this.lastObj);
            this.lastObj = null;
        } else {
            this.macro[this.macro.length - 1].addNew(new WaitForTime(Date.now() - this.lastActionTime));

            var keyIndex = holding.findIndex(item => item.equals(newKey));
            holding.splice(keyIndex, 1);

            if (holding.length){
                this.macro.push(new Groupable(null, holding));
            }
        }

        this.lastActionTime = Date.now()

        return;
    }

    onMouseClick(event: any): void {
        // Record mouse Click
        if (!this.recording) {
            return;
        }

        const click = new Click(event.x, event.y, event.button);
        //this.addNew(click);
    }

    onMouseScroll(event: any): void {
        // Record mouse Scroll
        if (!this.recording) {
            return;
        }

        const scroll = new Scroll(event.x, event.y, event.amount);
        //this.addNew(scroll);
    }

    eventToKeyStroke(event: any): KeyStroke | SpecialKeyStroke {
        if (
            (event.rawcode >= 65 && event.rawcode <= 90) || // a-z
            (event.rawcode == 32) ||
            (event.rawcode >= 49 && event.rawcode <= 57)
        ) {
            return new KeyStroke(event.rawcode);
        }

        return new SpecialKeyStroke(event);
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
            this.lastActionTime = Date.now();

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
            //group.items.forEach((step) => {
                steps.element(step.toXML());
            })
        });

        const xmlString = xmlDoc.end({ pretty: true });
        fs.writeFileSync('macro.xml', xmlString, 'utf-8');
    }
}

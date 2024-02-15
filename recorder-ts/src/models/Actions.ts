export class Actions {
    action: "START" | "END"

    constructor(action: "START" | "END") {
        this.action = action;
    }

    equals(value: Actions): boolean {
        return this.action == value.action;
    }

    toXML(): any {
        return {
            Actions: {
                "@type": this.action
            }
        }
    }
}
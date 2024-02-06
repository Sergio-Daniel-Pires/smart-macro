export class Actions {
    action: "START" | "END"

    constructor(action: "START" | "END") {
        this.action = action;
    }

    equals(value: Actions): boolean {
        return this.action == value.action;
    }

    toString(): string {
        return this.action;
    }

    toXML(): any {
        return {
            Actions: {
                "@type": this.action
            }
        }
    }
}
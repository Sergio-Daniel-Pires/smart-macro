import { Incremental } from "./Incremental";
import { KeyStroke } from "./KeyStroke";

export class Groupable {
    groupType: typeof Incremental;
    items: Array<Incremental>;

    constructor(newObj: Incremental) {
        this.items = [];
        this.addNew(newObj);
        this.groupType = newObj.constructor as typeof Incremental;
    }

    addNew(newObj: Incremental): void {
        if (this.items.length > 0 && this.items[this.items.length - 1].equals(newObj)) {
            this.items[this.items.length - 1].increment();
        } else {
            this.items.push(newObj);
        }
    }

    toString(): string {
        if (this instanceof KeyStroke) {
            const word = this.items.map(item => item.toString()).join('');
            return `${this.groupType.name}: '${word}'`;
        } else {
            return `${this.groupType.name}: ${this.items.map(item => item.toString()).join(', ')}`;
        }
    }
}
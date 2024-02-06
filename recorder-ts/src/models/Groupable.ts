import { Incremental } from "./Incremental";
import { KeyStroke } from "./KeyStroke";
import { WaitForTime } from "./WaitFor";
import { Actions } from "./Actions";
import { KeyWord } from "./KeyWord";

export class Groupable {
    items: Array<Incremental | WaitForTime | Actions>;

    constructor(newObj: Incremental | WaitForTime | Actions = null) {
        this.items = [];

        if (!newObj === null) {
            this.items.push(newObj);
        }
    }

    addNew(newObj: Incremental | WaitForTime | Actions): void {
        const lastItem = this.items[this.items.length - 1];

        if (
            this.items.length > 0 &&
            newObj instanceof Incremental &&
            lastItem instanceof Incremental &&
            lastItem.equals(newObj)
        ) {
            lastItem.increment();
        } else {
            this.items.push(newObj);
        }
    }

    toString(): string {
        if (this instanceof KeyStroke) {
            const word = this.items.map(item => item.toString()).join('');
            return `${this.constructor}: '${word}'`;
        } else {
            return `${this.constructor}: ${this.items.map(item => item.toString()).join(', ')}`;
        }
    }

    collapseList(): Array<Incremental | WaitForTime | Actions | KeyWord> {
        // Create new XML element
        // Add items to xml element
        let groupingKeys: boolean = false;
        let newItems: Array<Incremental | WaitForTime | Actions | KeyWord> = [];

        this.items.forEach(item => {
            if (item.constructor === KeyStroke && item['button'] >= 65 && item['button'] <= 90) {
                if (!groupingKeys){
                    newItems.push(new KeyWord(item))
                    groupingKeys = true;
                } else {
                    let lastItem = newItems[newItems.length - 1];

                    if (lastItem.constructor === KeyWord) {
                        lastItem.newChar(item);
                    }
                }
            } else {
                groupingKeys = false;
                newItems.push(item);
            }
        });

        return newItems;
    }
}
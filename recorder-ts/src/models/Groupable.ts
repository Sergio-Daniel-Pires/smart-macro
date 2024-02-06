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

    toXML(): any {
        // Create new XML element
        let groupableXML: any = {
            Groupable: {
                '@steps': this.items.length,
                '#list': []
            }
        };

        // Add items to xml element
        let groupingKeys: boolean = false;
        let groupableList: Array<any> = groupableXML.Groupable['#list'];

        this.items.forEach(item => {
            if (item.constructor === KeyStroke) {
                if (!groupingKeys){
                    groupableList.push(new KeyWord(item['button']))
                    groupingKeys = true;
                } else {
                    groupableList[groupableList.length - 1].newChar(item['button'], item['delay'])
                }
            } else {
                groupingKeys = false;
            }
        });

        return groupableXML;
    }
}
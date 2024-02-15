import xmlbuilder = require("xmlbuilder");
import { Actions } from "./Actions";
import { Incremental } from "./Incremental";

export class Holding {
    items: Array<Incremental | Actions | Holding>;
    parent: Holding;

    constructor(parent: Holding, newObj: Incremental | Actions) {
        this.parent = parent;

        // Only has delay if was pressed and released in sequence
        this.items = [newObj];
    }

    addNew (newObj: Incremental | Actions | Holding): void {
        this.items.push(newObj);
    }

    getLast (): Incremental | Actions {
        let lastItem = this.items[this.items.length - 1];

        if (lastItem instanceof Holding) {
            return lastItem.getLast();
        } else {
            return lastItem;
        }
    }

    addHolding(node: xmlbuilder.XMLElement): void {
        this.items.forEach(step => {
            if (step instanceof Holding) {
                var newHolding = node.element("Holding")
                step.addHolding(newHolding);
            } else {
                node.element(step.toXML());
            }
        });
    }
}

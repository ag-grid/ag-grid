import { Text } from './scene/shape/text';
import { PointerEvents } from './scene/node';
import { Observable } from './util/observable';
export class Caption extends Observable {
    constructor() {
        super();
        this.node = new Text();
        this.enabled = false;
        const node = this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = PointerEvents.None;
    }
    set text(value) {
        this.node.text = value;
    }
    get text() {
        return this.node.text;
    }
    set fontStyle(value) {
        this.node.fontStyle = value;
    }
    get fontStyle() {
        return this.node.fontStyle;
    }
    set fontWeight(value) {
        this.node.fontWeight = value;
    }
    get fontWeight() {
        return this.node.fontWeight;
    }
    set fontSize(value) {
        this.node.fontSize = value;
    }
    get fontSize() {
        return this.node.fontSize;
    }
    set fontFamily(value) {
        this.node.fontFamily = value;
    }
    get fontFamily() {
        return this.node.fontFamily;
    }
    set color(value) {
        this.node.fill = value;
    }
    get color() {
        return this.node.fill;
    }
}
Caption.PADDING = 10;

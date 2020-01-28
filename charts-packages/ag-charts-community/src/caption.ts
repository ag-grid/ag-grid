import { Padding } from "./util/padding";
import { Text } from "./scene/shape/text";
import { PointerEvents } from "./scene/node";
import { FontStyle, FontWeight } from "./scene/shape/text";
import { Observable, reactive } from "./util/observable";

export class Caption extends Observable {
    readonly node: Text = new Text();

    @reactive('change') enabled = true;
    @reactive('change') padding = new Padding(10);

    set text(value: string) {
        if (this.node.text !== value) {
            this.node.text = value;
            this.fireEvent({ type: 'change' });
        }
    }
    get text(): string {
        return this.node.text;
    }

    set fontStyle(value: FontStyle | undefined) {
        if (this.node.fontStyle !== value) {
            this.node.fontStyle = value;
            this.fireEvent({ type: 'change' });
        }
    }
    get fontStyle(): FontStyle | undefined {
        return this.node.fontStyle;
    }

    set fontWeight(value: FontWeight | undefined) {
        if (this.node.fontWeight !== value) {
            this.node.fontWeight = value;
            this.fireEvent({ type: 'change' });
        }
    }
    get fontWeight(): FontWeight | undefined {
        return this.node.fontWeight;
    }

    set fontSize(value: number) {
        if (this.node.fontSize !== value) {
            this.node.fontSize = value;
            this.fireEvent({ type: 'change' });
        }
    }
    get fontSize(): number {
        return this.node.fontSize;
    }

    set fontFamily(value: string) {
        if (this.node.fontFamily !== value) {
            this.node.fontFamily = value;
            this.fireEvent({ type: 'change' });
        }
    }
    get fontFamily(): string {
        return this.node.fontFamily;
    }

    set color(value: string | undefined) {
        if (this.node.fill !== value) {
            this.node.fill = value;
            this.fireEvent({ type: 'change' });
        }
    }
    get color(): string | undefined {
        return this.node.fill;
    }

    constructor() {
        super();

        const node = this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = PointerEvents.None;
    }
}

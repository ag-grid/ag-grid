import { Text, FontStyle, FontWeight } from './scene/shape/text';
import { PointerEvents } from './scene/node';
import { Observable } from './util/observable';
import { BOOLEAN, Validate } from './util/validation';

export class Caption extends Observable {
    static readonly PADDING = 10;

    readonly node: Text = new Text();

    @Validate(BOOLEAN)
    enabled = false;

    set text(value: string) {
        this.node.text = value;
    }
    get text(): string {
        return this.node.text;
    }

    set fontStyle(value: FontStyle | undefined) {
        this.node.fontStyle = value;
    }
    get fontStyle(): FontStyle | undefined {
        return this.node.fontStyle;
    }

    set fontWeight(value: FontWeight | undefined) {
        this.node.fontWeight = value;
    }
    get fontWeight(): FontWeight | undefined {
        return this.node.fontWeight;
    }

    set fontSize(value: number) {
        this.node.fontSize = value;
    }
    get fontSize(): number {
        return this.node.fontSize;
    }

    set fontFamily(value: string) {
        this.node.fontFamily = value;
    }
    get fontFamily(): string {
        return this.node.fontFamily;
    }

    set color(value: string | undefined) {
        this.node.fill = value;
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

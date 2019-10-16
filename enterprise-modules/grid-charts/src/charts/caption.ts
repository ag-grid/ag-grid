import { Padding } from "./util/padding";
import { Text } from "./scene/shape/text";
import { PointerEvents } from "./scene/node";
import { FontStyle, FontWeight } from "./scene/shape/text";

export class Caption {
    onChange?: () => void;

    readonly node: Text = new Text();

    constructor() {
        const node = this.node;

        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = PointerEvents.None;
    }

    set text(value: string) {
        if (this.node.text !== value) {
            this.node.text = value;
            this.update();
        }
    }
    get text(): string {
        return this.node.text;
    }

    set fontStyle(value: FontStyle | undefined) {
        if (this.node.fontStyle !== value) {
            this.node.fontStyle = value;
            this.update();
        }
    }
    get fontStyle(): FontStyle | undefined {
        return this.node.fontStyle;
    }

    set fontWeight(value: FontWeight | undefined) {
        if (this.node.fontWeight !== value) {
            this.node.fontWeight = value;
            this.update();
        }
    }
    get fontWeight(): FontWeight | undefined {
        return this.node.fontWeight;
    }

    set fontSize(value: number) {
        if (this.node.fontSize !== value) {
            this.node.fontSize = value;
            this.update();
        }
    }
    get fontSize(): number {
        return this.node.fontSize;
    }

    set fontFamily(value: string) {
        if (this.node.fontFamily !== value) {
            this.node.fontFamily = value;
            this.update();
        }
    }
    get fontFamily(): string {
        return this.node.fontFamily;
    }

    set color(value: string) {
        if (this.node.fill !== value) {
            this.node.fill = value;
            this.update();
        }
    }
    get color(): string {
        return this.node.fill || '';
    }

    private _enabled: boolean = true;
    set enabled(value: boolean) {
        if (this._enabled !== value) {
            this._enabled = value;
            this.update();
        }
    }
    get enabled(): boolean {
        return this._enabled;
    }

    private _padding: Padding = new Padding(10);
    set padding(value: Padding) {
        if (this._padding !== value) {
            this._padding = value;
            this.update();
        }
    }
    get padding(): Padding {
        return this._padding;
    }

    private update() {
        if (this.onChange) {
            this.onChange();
        }
    }
}

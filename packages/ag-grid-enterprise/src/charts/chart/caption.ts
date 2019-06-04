import { Padding } from "../util/padding";
import { Text } from "../scene/shape/text";
import { PointerEvents } from "../scene/node";

export class Caption {

    static create(params: {
        text?: string,
        font?: string,
        color?: string
    } = {}): Caption {
        const caption = new Caption();

        caption.text = params.text || '';
        caption.font = params.font || 'bold 14px Verdana, sans-serif';
        caption.color = params.color || 'black';
        caption.requestLayout();

        return caption;
    }

    onLayoutChange?: () => void;

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
            this.requestLayout();
        }
    }
    get text(): string {
        return this.node.text;
    }

    set font(value: string) {
        if (this.node.font !== value) {
            this.node.font = value;
            this.requestLayout();
        }
    }
    get font(): string {
        return this.node.font;
    }

    set color(value: string) {
        if (this.node.fill !== value) {
            this.node.fill = value;
            this.requestLayout();
        }
    }
    get color(): string {
        return this.node.fill || '';
    }

    private _enabled: boolean = true;
    set enabled(value: boolean) {
        if (this._enabled !== value) {
            this._enabled = value;
            this.requestLayout();
        }
    }
    get enabled(): boolean {
        return this._enabled;
    }

    private _padding: Padding = new Padding(10);
    set padding(value: Padding) {
        if (this._padding !== value) {
            this._padding = value;
            this.requestLayout();
        }
    }
    get padding(): Padding {
        return this._padding;
    }

    private requestLayout() {
        if (this.onLayoutChange) {
            this.onLayoutChange();
        }
    }
}

import { Padding } from "./util/padding";
import { Text } from "./scene/shape/text";
import { PointerEvents } from "./scene/node";

export class Caption {

    static create(params: {
        text?: string,
        fontStyle?: string,
        fontWeight?: string,
        fontSize?: number,
        fontFamily?: string,
        color?: string
    } = {}): Caption {
        const caption = new Caption();

        caption.text = params.text || '';
        caption.fontStyle = params.fontStyle;
        caption.fontWeight = params.fontWeight || 'bold';
        caption.fontSize = params.fontSize || 14;
        caption.fontFamily = params.fontFamily || 'Verdana, sans-serif';
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

    set fontStyle(value: string | undefined) {
        if (this.node.fontStyle !== value) {
            this.node.fontStyle = value;
            this.requestLayout();
        }
    }
    get fontStyle(): string | undefined {
        return this.node.fontStyle;
    }

    set fontWeight(value: string | undefined) {
        if (this.node.fontWeight !== value) {
            this.node.fontWeight = value;
            this.requestLayout();
        }
    }
    get fontWeight(): string | undefined {
        return this.node.fontWeight;
    }

    set fontSize(value: number) {
        if (this.node.fontSize !== value) {
            this.node.fontSize = value;
            this.requestLayout();
        }
    }
    get fontSize(): number {
        return this.node.fontSize;
    }

    set fontFamily(value: string) {
        if (this.node.fontFamily !== value) {
            this.node.fontFamily = value;
            this.requestLayout();
        }
    }
    get fontFamily(): string {
        return this.node.fontFamily;
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

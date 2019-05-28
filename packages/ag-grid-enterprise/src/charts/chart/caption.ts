import { Padding } from "../util/padding";
import { Text } from "../scene/shape/text";

export class Caption {

    static create(text: string, font: string = 'bold 14px Verdana, sans-serif'): Caption {
        const caption = new Caption();

        caption.text = text;
        caption.font = font;
        caption.requestLayout();

        return caption;
    }

    onLayoutChange?: () => void;

    readonly node: Text = new Text();

    constructor() {
        this.node.textAlign = 'center';
        this.node.textBaseline = 'top';
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
        if (this.node.fillStyle !== value) {
            this.node.fillStyle = value;
            this.requestLayout();
        }
    }
    get color(): string {
        return this.node.fillStyle || '';
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

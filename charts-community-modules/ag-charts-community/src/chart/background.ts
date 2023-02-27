import { Rect } from '../scene/shape/rect';
import { BOOLEAN, OPT_COLOR_STRING, Validate } from '../util/validation';

export class Background {
    readonly node: Rect = new Rect();

    set width(value: number) {
        this.node.width = value;
    }
    get width(): number {
        return this.node.width;
    }

    set height(value: number) {
        this.node.height = value;
    }
    get height(): number {
        return this.node.height;
    }

    @Validate(BOOLEAN)
    private _visible: boolean = true;
    set visible(value: boolean) {
        this._visible = value;
        this.node.visible = this._visible;
    }
    get visible(): boolean {
        return this._visible;
    }

    @Validate(OPT_COLOR_STRING)
    private _fill?: string;
    set fill(value: string | undefined) {
        this._fill = value;
        this.node.fill = this._fill;
    }
    get fill(): string | undefined {
        return this._fill;
    }
}

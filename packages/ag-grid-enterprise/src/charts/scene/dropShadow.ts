export interface DropShadowOptions {
    enabled?: boolean;
    color?: string;
    xOffset?: number;
    yOffset?: number;
    blur?: number;
}

export class DropShadow {
    constructor(options: DropShadowOptions) {
        this._enabled = options.enabled !== undefined ? options.enabled : true;
        this._color = options.color !== undefined ? options.color : 'black';
        this._xOffset = options.xOffset !== undefined ? options.xOffset : 0;
        this._yOffset = options.yOffset !== undefined ? options.yOffset : 0;
        this._blur = options.blur !== undefined ? options.blur : 0;
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

    private _color: string;
    set color(value: string) {
        if (this._color !== value) {
            this._color = value;
            this.update();
        }
    }
    get color(): string {
        return this._color;
    }

    private _xOffset: number;
    set xOffset(value: number) {
        if (this._xOffset !== value) {
            this._xOffset = value;
            this.update();
        }
    }
    get xOffset(): number {
        return this._xOffset;
    }

    private _yOffset: number;
    set yOffset(value: number) {
        if (this._yOffset !== value) {
            this._yOffset = value;
            this.update();
        }
    }
    get yOffset(): number {
        return this._yOffset;
    }

    private _blur: number;
    set blur(value: number) {
        if (this._blur !== value) {
            this._blur = value;
            this.update();
        }
    }
    get blur(): number {
        return this._blur;
    }

    onChange?: () => void;

    private update() {
        if (this.onChange) {
            this.onChange();
        }
    }
}

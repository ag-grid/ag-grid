export class DropShadow {
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

    private _color: string = 'rgba(0, 0, 0, 0.5)';
    set color(value: string) {
        if (this._color !== value) {
            this._color = value;
            this.update();
        }
    }
    get color(): string {
        return this._color;
    }

    private _xOffset: number = 0;
    set xOffset(value: number) {
        if (this._xOffset !== value) {
            this._xOffset = value;
            this.update();
        }
    }
    get xOffset(): number {
        return this._xOffset;
    }

    private _yOffset: number = 0;
    set yOffset(value: number) {
        if (this._yOffset !== value) {
            this._yOffset = value;
            this.update();
        }
    }
    get yOffset(): number {
        return this._yOffset;
    }

    private _blur: number = 5;
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

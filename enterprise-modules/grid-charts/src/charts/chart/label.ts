import { FontStyle, FontWeight } from "../scene/shape/text";

export class Label {
    onChange?: () => void;

    protected _enabled: boolean = true;
    set enabled(value: boolean) {
        if (this._enabled !== value) {
            this._enabled = value;
            this.update();
        }
    }
    get enabled(): boolean {
        return this._enabled;
    }

    private _fontStyle?: FontStyle;
    set fontStyle(value: FontStyle | undefined) {
        if (this._fontStyle !== value) {
            this._fontStyle = value;
            this.update();
        }
    }
    get fontStyle(): FontStyle | undefined {
        return this._fontStyle;
    }

    private _fontWeight?: FontWeight;
    set fontWeight(value: FontWeight | undefined) {
        if (this._fontWeight !== value) {
            this._fontWeight = value;
            this.update();
        }
    }
    get fontWeight(): FontWeight | undefined {
        return this._fontWeight;
    }

    private _fontSize: number = 12;
    set fontSize(value: number) {
        if (this._fontSize !== value) {
            this._fontSize = value;
            this.update();
        }
    }
    get fontSize(): number {
        return this._fontSize;
    }

    private _fontFamily: string = 'Verdana, sans-serif';
    set fontFamily(value: string) {
        if (this._fontFamily !== value) {
            this._fontFamily = value;
            this.update();
        }
    }
    get fontFamily(): string {
        return this._fontFamily;
    }

    private _color: string = 'black';
    set color(value: string) {
        if (this._color !== value) {
            this._color = value;
            this.update();
        }
    }
    get color(): string {
        return this._color;
    }

    protected update() {
        if (this.onChange) {
            this.onChange();
        }
    }
}
import { Group } from "../scene/group";
import { Rect } from "../scene/shape/rect";
import { Text } from "../scene/shape/text";

export class MarkerLabel extends Group {

    static className = 'MarkerLabel';

    static defaults = Object.freeze({
        padding: 4,
        markerSize: 14,
        labelFont: '12px Verdana, sans-serif',
        labelColor: 'black'
    });

    private marker = new Rect();
    private label = new Text();

    constructor() {
        super();

        this.marker.crisp = true;

        const label = this.label;
        label.textBaseline = 'middle';
        label.font = MarkerLabel.defaults.labelFont;
        label.fill = MarkerLabel.defaults.labelColor;
        label.y = 2; // for better looking vertical alignment of labels to markers

        this.append([this.marker, label]);
        this.update();
    }

    set labelText(value: string) {
        this.label.text = value;
    }
    get labelText(): string {
        return this.label.text;
    }

    set labelFont(value: string) {
        this.label.font = value;
    }
    get labelFont(): string {
        return this.label.font;
    }

    set labelColor(value: string | undefined) {
        this.label.fill = value;
    }
    get labelColor(): string | undefined {
        return this.label.fill;
    }

    private _markerSize: number = MarkerLabel.defaults.markerSize;
    set markerSize(value: number) {
        if (this._markerSize !== value) {
            this._markerSize = value;
            this.update();
        }
    }
    get markerSize(): number {
        return this._markerSize;
    }

    set markerFill(value: string | undefined) {
        this.marker.fill = value;
    }
    get markerFill(): string | undefined {
        return this.marker.fill;
    }

    set markerStroke(value: string | undefined) {
        this.marker.stroke = value;
    }
    get markerStroke(): string | undefined {
        return this.marker.stroke;
    }

    set markerStrokeWidth(value: number) {
        this.marker.strokeWidth = value;
    }
    get markerStrokeWidth(): number {
        return this.marker.strokeWidth;
    }

    set opacity(value: number) {
        this.marker.opacity = value;
        this.label.opacity = value;
    }
    get opacity(): number {
        return this.marker.opacity;
    }

    private _padding: number = MarkerLabel.defaults.padding;
    set padding(value: number) {
        if (this._padding !== value) {
            this._padding = value;
            this.update();
        }
    }
    get padding(): number {
        return this._padding;
    }

    private update() {
        const marker = this.marker;
        const markerSize = this.markerSize;

        marker.x = -markerSize / 2;
        marker.y = -markerSize / 2;
        marker.width = markerSize;
        marker.height = markerSize;

        this.label.x = markerSize / 2 + this.padding;
    }
}

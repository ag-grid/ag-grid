import { Group } from "../scene/group";
import { Text, FontStyle, FontWeight } from "../scene/shape/text";
import { Square } from "./marker/square";
import { Marker } from "./marker/marker";

export class MarkerLabel extends Group {

    static className = 'MarkerLabel';

    static defaults = Object.freeze({
        padding: 8,
        markerSize: 12,
        labelFont: '12px Verdana, sans-serif',
        labelFontStyle: undefined,
        labelFontWeight: undefined,
        labelFontSize: 12,
        labelFontFamily: 'Verdana, sans-serif',
        labelColor: 'black'
    });

    private label = new Text();

    constructor() {
        super();

        const label = this.label;
        label.textBaseline = 'middle';
        label.fontStyle = MarkerLabel.defaults.labelFontStyle;
        label.fontWeight = MarkerLabel.defaults.labelFontWeight;
        label.fontSize = MarkerLabel.defaults.labelFontSize;
        label.fontFamily = MarkerLabel.defaults.labelFontFamily;
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

    set labelFontStyle(value: FontStyle | undefined) {
        this.label.fontStyle = value;
    }
    get labelFontStyle(): FontStyle | undefined {
        return this.label.fontStyle;
    }

    set labelFontWeight(value: FontWeight | undefined) {
        this.label.fontWeight = value;
    }
    get labelFontWeight(): FontWeight | undefined {
        return this.label.fontWeight;
    }

    set labelFontSize(value: number) {
        this.label.fontSize = value;
    }
    get labelFontSize(): number {
        return this.label.fontSize;
    }

    set labelFontFamily(value: string) {
        this.label.fontFamily = value;
    }
    get labelFontFamily(): string {
        return this.label.fontFamily;
    }

    set labelColor(value: string | undefined) {
        this.label.fill = value;
    }
    get labelColor(): string | undefined {
        return this.label.fill;
    }

    private _marker: Marker = new Square();
    set marker(value: Marker) {
        if (this._marker !== value) {
            this.removeChild(this._marker);
            this._marker = value;
            this.appendChild(value);
            this.update();
        }
    }
    get marker(): Marker {
        return this._marker;
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

    set markerFillOpacity(value: number) {
        this.marker.fillOpacity = value;
    }
    get markerFillOpacity(): number {
        return this.marker.fillOpacity;
    }

    set markerStrokeOpacity(value: number) {
        this.marker.strokeOpacity = value;
    }
    get markerStrokeOpacity(): number {
        return this.marker.strokeOpacity;
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

        marker.size = markerSize;

        this.label.x = markerSize / 2 + this.padding;
    }
}

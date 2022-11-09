import { Group } from '../scene/group';
import { Text } from '../scene/shape/text';
import { Square } from './marker/square';
import { Marker } from './marker/marker';
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { RenderContext } from '../scene/node';
import { FontStyle, FontWeight } from './agChartOptions';

export class MarkerLabel extends Group {
    static className = 'MarkerLabel';

    private label = new Text();

    constructor() {
        super();

        const label = this.label;
        label.textBaseline = 'middle';
        label.fontSize = 12;
        label.fontFamily = 'Verdana, sans-serif';
        label.fill = 'black';
        // For better looking vertical alignment of labels to markers.
        label.y = HdpiCanvas.has.textMetrics ? 1 : 0;

        this.append([this.marker, label]);
        this.update();
    }

    set text(value: string) {
        this.label.text = value;
    }
    get text(): string {
        return this.label.text;
    }

    set fontStyle(value: FontStyle | undefined) {
        this.label.fontStyle = value;
    }
    get fontStyle(): FontStyle | undefined {
        return this.label.fontStyle;
    }

    set fontWeight(value: FontWeight | undefined) {
        this.label.fontWeight = value;
    }
    get fontWeight(): FontWeight | undefined {
        return this.label.fontWeight;
    }

    set fontSize(value: number) {
        this.label.fontSize = value;
    }
    get fontSize(): number {
        return this.label.fontSize;
    }

    set fontFamily(value: string) {
        this.label.fontFamily = value;
    }
    get fontFamily(): string {
        return this.label.fontFamily;
    }

    set color(value: string | undefined) {
        this.label.fill = value;
    }
    get color(): string | undefined {
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

    private _markerSize: number = 15;
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

    private _spacing: number = 8;
    set spacing(value: number) {
        if (this._spacing !== value) {
            this._spacing = value;
            this.update();
        }
    }
    get spacing(): number {
        return this._spacing;
    }

    private update() {
        const marker = this.marker;
        const markerSize = this.markerSize;

        marker.size = markerSize;

        this.label.x = markerSize / 2 + this.spacing;
    }

    render(renderCtx: RenderContext): void {
        // Cannot override field Group.opacity with get/set pair, so
        // propagate opacity changes here.
        this.marker.opacity = this.opacity;
        this.label.opacity = this.opacity;

        super.render(renderCtx);
    }
}

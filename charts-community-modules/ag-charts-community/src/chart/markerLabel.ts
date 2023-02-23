import { Group } from '../scene/group';
import { Text } from '../scene/shape/text';
import { Square } from './marker/square';
import { Marker } from './marker/marker';
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { RenderContext } from '../scene/node';
import { FontStyle, FontWeight } from './agChartOptions';
import { ProxyPropertyOnWrite } from '../util/proxy';

export class MarkerLabel extends Group {
    static className = 'MarkerLabel';

    private label = new Text();

    constructor() {
        super({ name: 'markerLabelGroup' });

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

    @ProxyPropertyOnWrite('label')
    text: string;

    @ProxyPropertyOnWrite('label')
    fontStyle?: FontStyle;

    @ProxyPropertyOnWrite('label')
    fontWeight?: FontWeight;

    @ProxyPropertyOnWrite('label')
    fontSize: number;

    @ProxyPropertyOnWrite('label')
    fontFamily: string;

    @ProxyPropertyOnWrite('label')
    color: string;

    @ProxyPropertyOnWrite('marker')
    markerFill: string;

    @ProxyPropertyOnWrite('marker')
    markerStroke: string;

    @ProxyPropertyOnWrite('marker')
    markerStrokeWidth: number;

    @ProxyPropertyOnWrite('marker')
    markerFillOpacity: number;

    @ProxyPropertyOnWrite('marker')
    markerStrokeOpacity: number;

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

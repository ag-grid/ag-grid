import { Group } from '../scene/group';
import type { Marker } from './marker/marker';
import type { RenderContext } from '../scene/node';
import type { FontStyle, FontWeight } from './agChartOptions';
export declare class MarkerLabel extends Group {
    static className: string;
    private label;
    constructor();
    text?: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    markerFill?: string;
    markerStroke?: string;
    markerStrokeWidth?: number;
    markerFillOpacity?: number;
    markerStrokeOpacity?: number;
    private _marker;
    set marker(value: Marker);
    get marker(): Marker;
    private _markerSize;
    set markerSize(value: number);
    get markerSize(): number;
    private _spacing;
    set spacing(value: number);
    get spacing(): number;
    private update;
    render(renderCtx: RenderContext): void;
}
//# sourceMappingURL=markerLabel.d.ts.map
import { Group } from '../scene/group';
import { FontStyle, FontWeight } from '../scene/shape/text';
import { Marker } from './marker/marker';
import { AgChartLegendClickEvent, AgChartLegendListeners } from './agChartOptions';
export interface LegendDatum {
    id: string;
    itemId: any;
    enabled: boolean;
    marker: {
        shape?: string | (new () => Marker);
        fill: string;
        stroke: string;
        fillOpacity: number;
        strokeOpacity: number;
    };
    label: {
        text: string;
    };
}
export declare enum LegendOrientation {
    Vertical = 0,
    Horizontal = 1
}
export declare enum LegendPosition {
    Top = "top",
    Right = "right",
    Bottom = "bottom",
    Left = "left"
}
interface LegendLabelFormatterParams {
    id: string;
    itemId: any;
    value: string;
}
export declare class LegendLabel {
    maxLength?: number;
    color: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
    formatter?: (params: LegendLabelFormatterParams) => string;
    getFont(): string;
}
export declare class LegendMarker {
    size: number;
    /**
     * If the marker type is set, the legend will always use that marker type for all its items,
     * regardless of the type that comes from the `data`.
     */
    _shape?: string | (new () => Marker);
    set shape(value: string | (new () => Marker) | undefined);
    get shape(): string | (new () => Marker) | undefined;
    /**
     * Padding between the marker and the label within each legend item.
     */
    padding: number;
    strokeWidth: number;
    parent?: {
        onMarkerShapeChange(): void;
    };
}
export declare class LegendItem {
    readonly marker: LegendMarker;
    readonly label: LegendLabel;
    /** Used to constrain the width of legend items. */
    maxWidth?: number;
    /**
     * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
     * and as few rows as possible when positioned to top or bottom. This config specifies the amount of horizontal
     * padding between legend items.
     */
    paddingX: number;
    /**
     * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
     * and as few rows as possible when positioned to top or bottom. This config specifies the amount of vertical
     * padding between legend items.
     */
    paddingY: number;
}
export declare class LegendListeners implements Required<AgChartLegendListeners> {
    legendItemClick: (event: AgChartLegendClickEvent) => void;
}
export declare class Legend {
    static className: string;
    readonly id: string;
    onLayoutChange?: () => void;
    readonly group: Group;
    private itemSelection;
    private oldSize;
    readonly item: LegendItem;
    readonly listeners: LegendListeners;
    truncatedItems: Set<string>;
    private _data;
    set data(value: LegendDatum[]);
    get data(): LegendDatum[];
    private _enabled;
    set enabled(value: boolean);
    get enabled(): boolean;
    orientation: LegendOrientation;
    private _position;
    set position(value: LegendPosition);
    get position(): LegendPosition;
    /** Reverse the display order of legend items if `true`. */
    reverseOrder?: boolean;
    constructor();
    onMarkerShapeChange(): void;
    /**
     * Spacing between the legend and the edge of the chart's element.
     */
    spacing: number;
    private characterWidths;
    private getCharacterWidths;
    readonly size: [number, number];
    /**
     * The method is given the desired size of the legend, which only serves as a hint.
     * The vertically oriented legend will take as much horizontal space as needed, but will
     * respect the height constraints, and the horizontal legend will take as much vertical
     * space as needed in an attempt not to exceed the given width.
     * After the layout is done, the {@link size} will contain the actual size of the legend.
     * If the actual size is not the same as the previous actual size, the legend will fire
     * the 'layoutChange' event to communicate that another layout is needed, and the above
     * process should be repeated.
     * @param width
     * @param height
     */
    performLayout(width: number, height: number): false | undefined;
    update(): void;
    getDatumForPoint(x: number, y: number): LegendDatum | undefined;
}
export {};

import { Group } from "../scene/group";
import { FontStyle, FontWeight } from "../scene/shape/text";
import { Marker } from "./marker/marker";
import { Observable, PropertyChangeEvent, SourceEvent } from "../util/observable";
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
export interface LegendClickEvent extends SourceEvent<Legend> {
    event: MouseEvent;
    itemId: string;
    enabled: boolean;
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
export declare class LegendLabel extends Observable {
    color: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
}
export declare class LegendMarker extends Observable {
    size: number;
    /**
     * If the marker type is set, the legend will always use that marker type for all its items,
     * regardless of the type that comes from the `data`.
     */
    shape?: string | (new () => Marker);
    /**
     * Padding between the marker and the label within each legend item.
     */
    padding: number;
    strokeWidth: number;
}
export declare class LegendItem extends Observable {
    readonly marker: LegendMarker;
    readonly label: LegendLabel;
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
    constructor();
}
export declare class Legend extends Observable {
    static className: string;
    readonly id: string;
    onLayoutChange?: () => void;
    readonly group: Group;
    private itemSelection;
    private oldSize;
    readonly item: LegendItem;
    data: LegendDatum[];
    enabled: boolean;
    orientation: LegendOrientation;
    position: LegendPosition;
    /**
     * Spacing between the legend and the edge of the chart's element.
     */
    spacing: number;
    /**
     * @deprecated Please use {@link item.paddingX} instead.
     */
    layoutHorizontalSpacing: number;
    /**
     * @deprecated Please use {@link item.paddingY} instead.
     */
    layoutVerticalSpacing: number;
    /**
     * @deprecated Please use {@link item.marker.padding} instead.
     */
    itemSpacing: number;
    /**
     * @deprecated Please use {@link item.marker.shape} instead.
     */
    markerShape: string | (new () => Marker) | undefined;
    /**
     * @deprecated Please use {@link item.marker.size} instead.
     */
    markerSize: number;
    /**
     * @deprecated Please use {@link item.marker.strokeWidth} instead.
     */
    strokeWidth: number;
    /**
     * @deprecated Please use {@link item.label.color} instead.
     */
    color: string;
    /**
     * @deprecated Please use {@link item.label.fontStyle} instead.
     */
    fontStyle: FontStyle | undefined;
    /**
     * @deprecated Please use {@link item.label.fontWeight} instead.
     */
    fontWeight: FontWeight | undefined;
    /**
     * @deprecated Please use {@link item.label.fontSize} instead.
     */
    fontSize: number;
    /**
     * @deprecated Please use {@link item.label.fontFamily} instead.
     */
    fontFamily: string;
    constructor();
    private _size;
    readonly size: Readonly<[number, number]>;
    protected onDataChange(event: PropertyChangeEvent<this, LegendDatum[]>): void;
    protected onEnabledChange(event: PropertyChangeEvent<this, boolean>): void;
    protected onPositionChange(event: PropertyChangeEvent<this, LegendPosition>): void;
    protected onMarkerShapeChange(): void;
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

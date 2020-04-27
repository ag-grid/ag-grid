import { Group } from "../scene/group";
import { FontStyle, FontWeight } from "../scene/shape/text";
import { Marker } from "./marker/marker";
import { Observable, PropertyChangeEvent } from "../util/observable";
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
export declare class Legend extends Observable {
    static className: string;
    readonly id: string;
    onLayoutChange?: () => void;
    readonly group: Group;
    private itemSelection;
    private oldSize;
    data: LegendDatum[];
    enabled: boolean;
    orientation: LegendOrientation;
    position: LegendPosition;
    /**
     * Spacing between the legend and the edge of the chart's element.
     */
    spacing: number;
    /**
     * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
     * and as few rows as possible when positioned to top or bottom. This config specifies the amount of horizontal
     * spacing between legend items.
     */
    layoutHorizontalSpacing: number;
    /**
     * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
     * and as few rows as possible when positioned to top or bottom. This config specifies the amount of vertical
     * spacing between legend items.
     */
    layoutVerticalSpacing: number;
    /**
     * Spacing between the marker and the label within each legend item.
     */
    itemSpacing: number;
    markerShape?: string | (new () => Marker);
    markerSize: number;
    strokeWidth: number;
    color: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
    constructor();
    private _size;
    readonly size: Readonly<[number, number]>;
    protected onDataChange(event: PropertyChangeEvent<this, LegendDatum[]>): void;
    protected onEnabledChange(event: PropertyChangeEvent<this, Boolean>): void;
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
    performLayout(width: number, height: number): boolean;
    update(): void;
    getDatumForPoint(x: number, y: number): LegendDatum | undefined;
}

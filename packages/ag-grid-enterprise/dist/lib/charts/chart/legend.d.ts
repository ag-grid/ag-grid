// ag-grid-enterprise v21.2.2
import { Group } from "../scene/group";
export interface LegendDatum {
    id: string;
    itemId: any;
    enabled: boolean;
    marker: {
        fill: string;
        stroke: string;
    };
    label: {
        text: string;
    };
}
export declare enum Orientation {
    Vertical = 0,
    Horizontal = 1
}
export declare class Legend {
    onLayoutChange?: () => void;
    readonly group: Group;
    private itemSelection;
    private oldSize;
    private _size;
    readonly size: Readonly<[number, number]>;
    private _data;
    data: LegendDatum[];
    private _orientation;
    orientation: Orientation;
    private _enabled;
    enabled: boolean;
    private _itemPaddingX;
    itemPaddingX: number;
    private _itemPaddingY;
    itemPaddingY: number;
    private _markerPadding;
    markerPadding: number;
    private _labelColor;
    labelColor: string;
    private _labelFontStyle;
    labelFontStyle: string | undefined;
    private _labelFontWeight;
    labelFontWeight: string | undefined;
    private _labelFontSize;
    labelFontSize: number;
    private _labelFontFamily;
    labelFontFamily: string;
    private _markerSize;
    markerSize: number;
    private _markerStrokeWidth;
    markerStrokeWidth: number;
    private requestLayout;
    /**
     * The method is given the desired size of the legend, which only serves as a hint.
     * The vertically oriented legend will take as much horizontal space as needed, but will
     * respect the height constraints, and the horizontal legend will take as much vertical
     * space as needed in an attempt not to exceed the given width.
     * After the layout is done, the {@link size} will contain the actual size of the legend.
     * If the actual size is not the same as the previous actual size, the legend will notify
     * the parent component via the {@link onLayoutChange} callback that another layout is needed,
     * and the above process should be repeated.
     * @param width
     * @param height
     */
    performLayout(width: number, height: number): false | undefined;
    update(): void;
    datumForPoint(x: number, y: number): LegendDatum | undefined;
}

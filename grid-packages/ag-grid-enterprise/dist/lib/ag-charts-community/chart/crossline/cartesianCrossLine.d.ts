import type { AgCartesianCrossLineLabelOptions, AgCrossLineLabelPosition, FontStyle, FontWeight } from '../../options/agChartOptions';
import type { Scale } from '../../scale/scale';
import { BBox } from '../../scene/bbox';
import { Group } from '../../scene/group';
import { ChartAxisDirection } from '../chartAxisDirection';
import { Layers } from '../layers';
import { type CrossLine, type CrossLineType } from './crossLine';
import type { CrossLineLabelPosition } from './crossLineLabelPosition';
declare class CartesianCrossLineLabel implements AgCartesianCrossLineLabelOptions {
    enabled?: boolean;
    text?: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
    /**
     * The padding between the label and the line.
     */
    padding: number;
    /**
     * The color of the labels.
     */
    color?: string;
    position?: CrossLineLabelPosition;
    rotation?: number;
    parallel?: boolean;
}
export declare class CartesianCrossLine implements CrossLine<CartesianCrossLineLabel> {
    protected static readonly LINE_LAYER_ZINDEX = Layers.SERIES_CROSSLINE_LINE_ZINDEX;
    protected static readonly RANGE_LAYER_ZINDEX = Layers.SERIES_CROSSLINE_RANGE_ZINDEX;
    protected static readonly LABEL_LAYER_ZINDEX = Layers.SERIES_LABEL_ZINDEX;
    static className: string;
    readonly id: string;
    enabled?: boolean;
    type?: CrossLineType;
    range?: [any, any];
    value?: any;
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    lineDash?: [];
    label: CartesianCrossLineLabel;
    scale?: Scale<any, number>;
    clippedRange: [number, number];
    gridLength: number;
    sideFlag: 1 | -1;
    parallelFlipRotation: number;
    regularFlipRotation: number;
    direction: ChartAxisDirection;
    readonly group: Group;
    readonly labelGroup: Group;
    private crossLineRange;
    private crossLineLabel;
    private labelPoint?;
    private data;
    private startLine;
    private endLine;
    private isRange;
    constructor();
    update(visible: boolean): void;
    calculateLayout(visible: boolean, reversedAxis?: boolean): BBox | undefined;
    private updateNodes;
    private createNodeData;
    private updateRangeNode;
    private updateLabel;
    private positionLabel;
    protected getZIndex(isRange?: boolean): number;
    private getRange;
    private computeLabelBBox;
    calculatePadding(padding: Partial<Record<AgCrossLineLabelPosition, number>>): void;
}
export {};

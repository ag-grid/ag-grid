import type { Group } from '../../scene/group';
import type { Scale } from '../../scale/scale';
import type { ChartAxisDirection } from '../chartAxisDirection';
import type { FontStyle, FontWeight, AgCrossLineLabelPosition } from '../agChartOptions';
export interface CrossLineLabel {
    enabled?: boolean;
    text?: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
    padding: number;
    color?: string;
    position?: AgCrossLineLabelPosition;
    rotation?: number;
    parallel?: boolean;
}
export declare type CrossLineType = 'line' | 'range';
export interface CrossLine {
    calculatePadding(padding: Partial<Record<AgCrossLineLabelPosition, number>>): void;
    clippedRange: [number, number];
    direction: ChartAxisDirection;
    enabled?: boolean;
    fill?: string;
    fillOpacity?: number;
    gridLength: number;
    group: Group;
    id: string;
    label: CrossLineLabel;
    lineDash?: number[];
    parallelFlipRotation: number;
    range?: [any, any];
    regularFlipRotation: number;
    scale?: Scale<any, number>;
    sideFlag: 1 | -1;
    stroke?: string;
    strokeOpacity?: number;
    strokeWidth?: number;
    type?: CrossLineType;
    update(visible: boolean): void;
    value?: any;
}
//# sourceMappingURL=crossLine.d.ts.map
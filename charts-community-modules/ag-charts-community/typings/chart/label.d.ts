import type { FontStyle, FontWeight } from './agChartOptions';
import { BBox } from '../scene/bbox';
import type { Matrix } from '../scene/matrix';
import type { PointLabelDatum } from '../util/labelPlacement';
export declare class Label {
    enabled: boolean;
    fontSize: number;
    fontFamily: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    color: string;
    getFont(): string;
}
export declare type Flag = 1 | -1;
export declare function calculateLabelRotation(opts: {
    rotation?: number;
    parallel?: boolean;
    regularFlipRotation?: number;
    parallelFlipRotation?: number;
}): {
    configuredRotation: number;
    defaultRotation: number;
    parallelFlipFlag: Flag;
    regularFlipFlag: Flag;
};
export declare function getLabelSpacing(minSpacing: number, rotated?: boolean): number;
export declare function getTextBaseline(parallel: boolean, labelRotation: number, sideFlag: Flag, parallelFlipFlag: Flag): CanvasTextBaseline;
export declare function getTextAlign(parallel: boolean, labelRotation: number, labelAutoRotation: number, sideFlag: Flag, regularFlipFlag: Flag): CanvasTextAlign;
export declare function calculateLabelBBox(text: string, bbox: BBox, labelX: number, labelY: number, labelMatrix: Matrix): PointLabelDatum;
//# sourceMappingURL=label.d.ts.map
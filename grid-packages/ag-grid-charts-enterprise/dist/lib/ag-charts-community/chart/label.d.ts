import type { FontStyle, FontWeight } from '../options/agChartOptions';
import type { AgChartLabelFormatterParams, AgChartLabelOptions } from '../options/chart/labelOptions';
import { BBox } from '../scene/bbox';
import type { Matrix } from '../scene/matrix';
import type { PointLabelDatum } from '../scene/util/labelPlacement';
import { BaseProperties } from '../util/properties';
import type { RequireOptional } from '../util/types';
import type { ChartAxisLabelFlipFlag } from './chartAxis';
export declare class Label<TParams = never, TDatum = any> extends BaseProperties implements AgChartLabelOptions<TDatum, RequireOptional<TParams>> {
    enabled: boolean;
    color: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
    formatter?: (params: AgChartLabelFormatterParams<TDatum> & RequireOptional<TParams>) => string | undefined;
    getFont(): string;
}
export declare function calculateLabelRotation(opts: {
    rotation?: number;
    parallel?: boolean;
    regularFlipRotation?: number;
    parallelFlipRotation?: number;
}): {
    configuredRotation: number;
    defaultRotation: number;
    parallelFlipFlag: ChartAxisLabelFlipFlag;
    regularFlipFlag: ChartAxisLabelFlipFlag;
};
export declare function getLabelSpacing(minSpacing: number, rotated?: boolean): number;
export declare function getTextBaseline(parallel: boolean, labelRotation: number, sideFlag: ChartAxisLabelFlipFlag, parallelFlipFlag: ChartAxisLabelFlipFlag): CanvasTextBaseline;
export declare function getTextAlign(parallel: boolean, labelRotation: number, labelAutoRotation: number, sideFlag: ChartAxisLabelFlipFlag, regularFlipFlag: ChartAxisLabelFlipFlag): CanvasTextAlign;
export declare function calculateLabelBBox(text: string, bbox: BBox, labelX: number, labelY: number, labelMatrix: Matrix): PointLabelDatum;

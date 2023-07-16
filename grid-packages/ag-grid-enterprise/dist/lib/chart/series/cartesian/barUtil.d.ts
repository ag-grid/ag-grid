import type { Point } from '../../../scene/point';
import type { AgBarSeriesFormat, AgCartesianSeriesLabelFormatterParams, FontFamily, FontWeight, FontStyle, AgBarSeriesOptions } from '../../agChartOptions';
import type { Rect } from '../../../scene/shape/rect';
import type { DropShadow } from '../../../scene/dropShadow';
import type { CartesianSeriesNodeDatum } from './cartesianSeries';
import type { SeriesItemHighlightStyle } from '../series';
import type { Text } from '../../../scene/shape/text';
import type { ModuleContext } from '../../../util/moduleContext';
declare type Bounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};
declare type LabelPlacement = 'start' | 'end' | 'inside' | 'outside';
declare type LabelDatum = Readonly<Point> & {
    readonly text: string;
    readonly textAlign: CanvasTextAlign;
    readonly textBaseline: CanvasTextBaseline;
};
export declare type RectConfig = {
    fill: string;
    stroke: string;
    strokeWidth: number;
    fillOpacity: number;
    strokeOpacity: number;
    lineDashOffset: number;
    lineDash?: number[];
    fillShadow?: DropShadow;
    crisp?: boolean;
    visible?: boolean;
};
export declare type LabelConfig = {
    enabled: boolean;
    fontFamily: FontFamily;
    fontSize: number;
    fontWeight?: FontWeight;
    fontStyle?: FontStyle;
    color?: string;
};
export declare function createLabelData({ value, rect, placement, seriesId, padding, formatter, barAlongX, ctx: { callbackCache }, }: {
    value: any;
    rect: Bounds;
    placement: LabelPlacement;
    seriesId: string;
    padding?: number;
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string;
    ctx: ModuleContext;
    barAlongX: boolean;
}): LabelDatum;
export declare function updateRect({ rect, config }: {
    rect: Rect;
    config: RectConfig;
}): void;
export declare function getRectConfig<Params extends Parameters<NonNullable<AgBarSeriesOptions['formatter']>>[0], ExtraParams extends {}>({ datum, isHighlighted, style, highlightStyle, formatter, seriesId, stackGroup, ctx: { callbackCache }, ...opts }: {
    datum: CartesianSeriesNodeDatum;
    isHighlighted: boolean;
    style: RectConfig;
    highlightStyle: SeriesItemHighlightStyle;
    formatter?: (params: Params & ExtraParams) => AgBarSeriesFormat;
    seriesId: string;
    stackGroup?: string;
    ctx: ModuleContext;
} & ExtraParams): RectConfig;
export declare function checkCrisp(visibleRange?: number[]): boolean;
export declare function updateLabel<LabelDatumType extends LabelDatum>({ labelNode, labelDatum, config, visible, }: {
    labelNode: Text;
    labelDatum?: LabelDatumType;
    config?: LabelConfig;
    visible: boolean;
}): void;
export {};
//# sourceMappingURL=barUtil.d.ts.map
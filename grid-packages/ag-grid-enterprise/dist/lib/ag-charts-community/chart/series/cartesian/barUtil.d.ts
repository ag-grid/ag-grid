import type { ModuleContext } from '../../../module/moduleContext';
import type { NodeUpdateState } from '../../../motion/fromToMotion';
import type { AgBarSeriesFormatterParams, AgBarSeriesStyle } from '../../../options/agChartOptions';
import type { DropShadow } from '../../../scene/dropShadow';
import type { Rect } from '../../../scene/shape/rect';
import type { ChartAxis } from '../../chartAxis';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { SeriesItemHighlightStyle } from '../series';
import type { CartesianSeriesNodeDatum } from './cartesianSeries';
export type RectConfig = {
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
export declare function updateRect({ rect, config }: {
    rect: Rect;
    config: RectConfig;
}): void;
interface NodeDatum extends Omit<CartesianSeriesNodeDatum, 'yKey' | 'yValue'> {
}
export declare function getRectConfig<Params extends Omit<AgBarSeriesFormatterParams<any>, 'yKey' | 'value'>, ExtraParams extends {}>({ datum, isHighlighted, style, highlightStyle, formatter, seriesId, ctx: { callbackCache }, ...opts }: {
    datum: NodeDatum;
    isHighlighted: boolean;
    style: RectConfig;
    highlightStyle: SeriesItemHighlightStyle;
    formatter?: (params: Params & ExtraParams) => AgBarSeriesStyle;
    seriesId: string;
    ctx: ModuleContext;
} & ExtraParams): RectConfig;
export declare function checkCrisp(visibleRange?: number[]): boolean;
type InitialPosition<T> = {
    isVertical: boolean;
    calculate: (datum: T, prevDatum?: T) => T;
};
export declare function collapsedStartingBarPosition(isVertical: boolean, axes: Record<ChartAxisDirection, ChartAxis | undefined>): InitialPosition<AnimatableBarDatum>;
export declare function midpointStartingBarPosition(isVertical: boolean): InitialPosition<AnimatableBarDatum>;
type AnimatableBarDatum = {
    x: number;
    y: number;
    height: number;
    width: number;
};
export declare function prepareBarAnimationFunctions<T extends AnimatableBarDatum>(initPos: InitialPosition<T>): {
    toFn: (rect: Rect, datum: T, status: NodeUpdateState) => {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    fromFn: (rect: Rect, datum: T, status: NodeUpdateState) => {
        animationDuration: number;
        animationDelay: number;
        x: number;
        y: number;
        width: number;
        height: number;
    };
};
export declare function resetBarSelectionsFn(_node: Rect, { x, y, width, height }: AnimatableBarDatum): {
    x: number;
    y: number;
    width: number;
    height: number;
};
export {};

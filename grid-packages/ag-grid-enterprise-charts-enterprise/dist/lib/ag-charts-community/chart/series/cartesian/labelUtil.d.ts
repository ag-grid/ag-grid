import type { AgChartLabelOptions } from '../../../options/agChartOptions';
import type { Point } from '../../../scene/point';
import type { Text } from '../../../scene/shape/text';
type Bounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};
type LabelPlacement = 'start' | 'end' | 'inside' | 'outside';
type LabelDatum = Point & {
    text: string;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
};
export declare function updateLabelNode(textNode: Text, label: AgChartLabelOptions<any, any>, labelDatum?: LabelDatum): void;
export declare function adjustLabelPlacement({ isPositive, isVertical, placement, padding, rect, }: {
    placement: LabelPlacement;
    isPositive: boolean;
    isVertical: boolean;
    padding?: number;
    rect: Bounds;
}): Omit<LabelDatum, 'text'>;
export {};

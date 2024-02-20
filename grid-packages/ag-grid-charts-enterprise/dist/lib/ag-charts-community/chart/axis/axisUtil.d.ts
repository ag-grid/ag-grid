import type { FromToFns } from '../../motion/fromToMotion';
import type { Group } from '../../scene/group';
import type { Line } from '../../scene/shape/line';
import type { Text } from '../../scene/shape/text';
export type AxisLineDatum = {
    x: number;
    y1: number;
    y2: number;
};
export type AxisDatum = {
    translationY: number;
    translationX?: number;
};
type AxisAnimationContext = {
    visible: boolean;
    min: number;
    max: number;
};
type AxisGroupDatum = {
    rotation: number;
    rotationCenterX: number;
    rotationCenterY: number;
    translationX: number;
    translationY: number;
};
type AxisNodeDatum = {
    translationY: number;
    tickId: string;
    visible: boolean;
};
type AxisLabelDatum = {
    tickId: string;
    x: number;
    y: number;
    rotation: number;
    rotationCenterX: number;
    translationY: number;
    range: number[];
};
export declare function prepareAxisAnimationContext(axis: {
    range: number[];
}): AxisAnimationContext;
export declare function prepareAxisAnimationFunctions(ctx: AxisAnimationContext): {
    tick: FromToFns<Line, any, AxisNodeDatum>;
    line: FromToFns<Line, any, AxisLineDatum>;
    label: FromToFns<Text, Partial<Omit<AxisLabelDatum, "range">>, AxisLabelDatum>;
    group: FromToFns<Group, any, AxisGroupDatum>;
};
export declare function resetAxisGroupFn(): (_node: Group, datum: AxisGroupDatum) => {
    rotation: number;
    rotationCenterX: number;
    rotationCenterY: number;
    translationX: number;
    translationY: number;
};
export declare function resetAxisSelectionFn(ctx: AxisAnimationContext): (_node: Line, datum: AxisNodeDatum) => {
    y: number;
    translationY: number;
    opacity: number;
    visible: boolean;
};
export declare function resetAxisLabelSelectionFn(): (_node: Text, datum: AxisLabelDatum) => {
    x: number;
    y: number;
    translationY: number;
    rotation: number;
    rotationCenterX: number;
};
export declare function resetAxisLineSelectionFn(): (_node: Line, datum: AxisLineDatum) => {
    x: number;
    y1: number;
    y2: number;
};
export {};

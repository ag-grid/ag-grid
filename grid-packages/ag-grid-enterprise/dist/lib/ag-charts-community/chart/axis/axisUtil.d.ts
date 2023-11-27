import type { FromToMotionPropFn, NodeUpdateState } from '../../motion/fromToMotion';
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
};
export declare function prepareAxisAnimationContext(axis: {
    range: number[];
}): AxisAnimationContext;
type WithTranslationY = {
    translationY: number;
};
export declare function prepareAxisAnimationFunctions<T extends AxisNodeDatum>(ctx: AxisAnimationContext): {
    tick: {
        fromFn: (node: Line | Text, datum: WithTranslationY, status: NodeUpdateState) => {
            animationDuration: number;
            animationDelay: number;
            translationY: number;
            opacity: number;
        };
        toFn: (_node: Line | Text, datum: WithTranslationY, status: NodeUpdateState) => {
            translationY: number;
            opacity: number;
        };
        intermediateFn: (node: Line | Text, _datum: T, _status: NodeUpdateState) => {
            visible: boolean;
        };
    };
    line: {
        fromFn: (node: Line, datum: AxisLineDatum) => any;
        toFn: (_node: Line, datum: AxisLineDatum) => {
            x: number;
            y1: number;
            y2: number;
        };
    };
    label: {
        fromFn: FromToMotionPropFn<Text, Partial<AxisLabelDatum>, AxisLabelDatum>;
        toFn: FromToMotionPropFn<Text, Partial<AxisLabelDatum>, AxisLabelDatum>;
    };
    group: {
        fromFn: (group: Group, _datum: AxisGroupDatum) => {
            animationDuration: number;
            animationDelay: number;
            rotation: number;
            translationX: number;
            translationY: number;
        };
        toFn: (_group: Group, datum: AxisGroupDatum) => {
            rotation: number;
            translationX: number;
            translationY: number;
        };
    };
};
export declare function resetAxisGroupFn(): (_node: Group, datum: AxisGroupDatum) => {
    rotation: number;
    rotationCenterX: number;
    rotationCenterY: number;
    translationX: number;
    translationY: number;
};
export declare function resetAxisSelectionFn(ctx: AxisAnimationContext): (_node: Line | Text, datum: AxisNodeDatum) => {
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

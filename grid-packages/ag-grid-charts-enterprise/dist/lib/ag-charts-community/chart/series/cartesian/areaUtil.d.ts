import type { FontStyle, FontWeight } from '../../../options/agChartOptions';
import type { Point } from '../../../scene/point';
import type { ProcessedOutputDiff } from '../../data/dataModel';
import type { SeriesNodeDatum } from '../seriesTypes';
import type { CartesianSeriesNodeDataContext, CartesianSeriesNodeDatum } from './cartesianSeries';
export declare enum AreaSeriesTag {
    Fill = 0,
    Stroke = 1,
    Marker = 2,
    Label = 3
}
export interface AreaPathPoint {
    point: {
        x: number;
        y: number;
        moveTo?: boolean;
    };
    size?: number;
    xValue?: string | number;
    yValue?: number;
    itemId?: string;
}
export type AreaPathDatum = {
    readonly points: AreaPathPoint[];
    readonly itemId: string;
};
export interface MarkerSelectionDatum extends Required<CartesianSeriesNodeDatum> {
    readonly index: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly cumulativeValue: number;
}
export interface LabelSelectionDatum extends Readonly<Point>, SeriesNodeDatum {
    readonly index: number;
    readonly itemId: any;
    readonly label?: {
        readonly text: string;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
        readonly fill: string;
    };
}
export interface AreaSeriesNodeDataContext extends CartesianSeriesNodeDataContext<MarkerSelectionDatum, LabelSelectionDatum> {
    fillData: AreaPathDatum;
    strokeData: AreaPathDatum;
    stackVisible: boolean;
}
export declare function prepareAreaPathAnimation(newData: AreaSeriesNodeDataContext, oldData: AreaSeriesNodeDataContext, diff?: ProcessedOutputDiff): {
    fill: {
        status: "added" | "removed" | "updated";
        path: {
            addPhaseFn: (ratio: number, path: import("../../../integrated-charts-scene").Path) => void;
            updatePhaseFn: (ratio: number, path: import("../../../integrated-charts-scene").Path) => void;
            removePhaseFn: (ratio: number, path: import("../../../integrated-charts-scene").Path) => void;
        };
        pathProperties: {
            fromFn: (_path: import("../../../integrated-charts-scene").Path) => {
                finish: {
                    visible: boolean;
                };
                phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
            } | {
                start: {
                    visible: boolean;
                };
                phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
            } | {
                phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
            };
            toFn: (_path: import("../../../integrated-charts-scene").Path) => {
                phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
            };
        };
    };
    marker: {
        fromFn: (marker: import("../../marker/marker").Marker, datum: import("./pathUtil").PathNodeDatumLike) => {
            opacity: number;
        } | {
            opacity: number;
            translationX: number | undefined;
            translationY: number | undefined;
            phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
        };
        toFn: (_marker: import("../../marker/marker").Marker, datum: import("./pathUtil").PathNodeDatumLike) => {
            opacity: number;
        } | {
            translationX: number | undefined;
            translationY: number | undefined;
            opacity: number;
            phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
        };
    };
} | undefined;

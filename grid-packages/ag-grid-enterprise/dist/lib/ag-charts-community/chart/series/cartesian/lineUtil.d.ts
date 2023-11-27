import type { Path } from '../../../scene/shape/path';
import type { ProcessedOutputDiff } from '../../data/dataModel';
import type { CartesianSeriesNodeDataContext } from './cartesianSeries';
import type { BackfillSplitMode, PathNodeDatumLike, PathPoint, PathPointChange, PathPointMap } from './pathUtil';
type LineContextLike = {
    scales: CartesianSeriesNodeDataContext['scales'];
    nodeData: PathNodeDatumLike[];
    visible: boolean;
};
export declare function pairContinuousData(newData: LineContextLike, oldData: LineContextLike, opts?: {
    backfillSplitMode?: BackfillSplitMode;
}): {
    result: PathPoint[];
    resultMap: {
        moved: {
            [key: string]: PathPoint;
            [key: number]: PathPoint;
        };
        added: {
            [key: string]: PathPoint;
            [key: number]: PathPoint;
        };
        removed: {
            [key: string]: PathPoint;
            [key: number]: PathPoint;
        };
    };
};
export declare function pairCategoryData(newData: LineContextLike, oldData: LineContextLike, diff: ProcessedOutputDiff, opts?: {
    backfillSplitMode?: BackfillSplitMode;
    multiDatum?: boolean;
}): {
    result: undefined;
    resultMap: undefined;
} | {
    result: PathPoint[];
    resultMap: PathPointMap<true>;
} | {
    result: PathPoint[];
    resultMap: PathPointMap<false>;
};
export declare function determinePathStatus(newData: LineContextLike, oldData: LineContextLike): "added" | "removed" | "updated";
export declare function prepareLinePathAnimationFns(newData: LineContextLike, oldData: LineContextLike, pairData: PathPoint[], visibleToggleMode: 'fade' | 'none', render: (pairData: PathPoint[], ratios: Partial<Record<PathPointChange, number>>, path: Path) => void): {
    status: "added" | "removed" | "updated";
    path: {
        addPhaseFn: (ratio: number, path: Path) => void;
        updatePhaseFn: (ratio: number, path: Path) => void;
        removePhaseFn: (ratio: number, path: Path) => void;
    };
    pathProperties: {
        fromFn: (_path: Path) => {
            finish: {
                visible: boolean;
            };
            animationDuration: number;
            animationDelay: number;
        } | {
            start: {
                visible: boolean;
            };
            animationDuration: number;
            animationDelay: number;
        } | {
            animationDuration: number;
            animationDelay: number;
        };
        toFn: (_path: Path) => {
            animationDuration: number;
            animationDelay: number;
        };
    };
};
export declare function prepareLinePathAnimation(newData: LineContextLike, oldData: LineContextLike, diff?: ProcessedOutputDiff): {
    marker: {
        fromFn: (marker: import("../../marker/marker").Marker, datum: PathNodeDatumLike) => {
            opacity: number;
        } | {
            animationDuration: number;
            animationDelay: number;
            opacity: number;
            translationX: number | undefined;
            translationY: number | undefined;
        };
        toFn: (_marker: import("../../marker/marker").Marker, datum: PathNodeDatumLike) => {
            opacity: number;
        } | {
            animationDuration: number;
            animationDelay: number;
            translationX: number | undefined;
            translationY: number | undefined;
            opacity: number;
        };
    };
    status: "added" | "removed" | "updated";
    path: {
        addPhaseFn: (ratio: number, path: Path) => void;
        updatePhaseFn: (ratio: number, path: Path) => void;
        removePhaseFn: (ratio: number, path: Path) => void;
    };
    pathProperties: {
        fromFn: (_path: Path) => {
            finish: {
                visible: boolean;
            };
            animationDuration: number;
            animationDelay: number;
        } | {
            start: {
                visible: boolean;
            };
            animationDuration: number;
            animationDelay: number;
        } | {
            animationDuration: number;
            animationDelay: number;
        };
        toFn: (_path: Path) => {
            animationDuration: number;
            animationDelay: number;
        };
    };
} | undefined;
export {};

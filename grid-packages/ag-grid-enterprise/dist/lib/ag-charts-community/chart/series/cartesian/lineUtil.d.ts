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
        added: {
            [key: string]: PathPoint;
            [key: number]: PathPoint;
        };
        removed: {
            [key: string]: PathPoint;
            [key: number]: PathPoint;
        };
        moved: {
            [key: string]: PathPoint;
            [key: number]: PathPoint;
        };
    };
};
export declare function pairCategoryData(newData: LineContextLike, oldData: LineContextLike, diff: ProcessedOutputDiff | undefined, opts?: {
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
            phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
        } | {
            start: {
                visible: boolean;
            };
            phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
        } | {
            phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
        };
        toFn: (_path: Path) => {
            phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
        };
    };
};
export declare function prepareLinePathAnimation(newData: LineContextLike, oldData: LineContextLike, diff?: ProcessedOutputDiff): {
    marker: {
        fromFn: (marker: import("../../marker/marker").Marker, datum: PathNodeDatumLike) => {
            opacity: number;
        } | {
            opacity: number;
            translationX: number | undefined;
            translationY: number | undefined;
            phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
        };
        toFn: (_marker: import("../../marker/marker").Marker, datum: PathNodeDatumLike) => {
            opacity: number;
        } | {
            translationX: number | undefined;
            translationY: number | undefined;
            opacity: number;
            phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
        };
    };
    hasMotion: boolean;
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
            phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
        } | {
            start: {
                visible: boolean;
            };
            phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
        } | {
            phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
        };
        toFn: (_path: Path) => {
            phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
        };
    };
} | undefined;
export {};

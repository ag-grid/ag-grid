import type { Point } from '../../../scene/point';
import type { Selection } from '../../../scene/selection';
import type { Path } from '../../../scene/shape/path';
import type { AnimationManager } from '../../interaction/animationManager';
import type { NodeDataDependant } from '../seriesTypes';
import type { CartesianSeriesNodeDatum } from './cartesianSeries';
export type PathPointChange = 'move' | 'in' | 'out';
export type PathPoint = {
    from?: Point;
    to?: Point;
    change: PathPointChange;
    moveTo: true | false | 'in' | 'out';
};
export type PathPointMap<ARRAY extends boolean = false> = {
    [key in 'moved' | 'added' | 'removed']: {
        [key: string]: ARRAY extends true ? PathPoint[] : PathPoint;
    };
};
export interface PathNodeDatumLike extends Pick<CartesianSeriesNodeDatum, 'xValue'> {
    readonly point: Point & {
        moveTo?: boolean;
    };
}
export declare function minMax(nodeData: PathNodeDatumLike[]): {
    min?: PathNodeDatumLike | undefined;
    max?: PathNodeDatumLike | undefined;
};
export type BackfillSplitMode = 'intersect' | 'static';
export type BackfillAddMode = 'fan-out' | 'static';
export declare function backfillPathPointData(result: PathPoint[], splitMode: BackfillSplitMode): void;
export declare function renderPartialPath(pairData: PathPoint[], ratios: Partial<Record<PathPointChange, number>>, path: Path): void;
export declare function pathSwipeInAnimation({ id, visible, nodeDataDependencies }: {
    id: string;
    visible: boolean;
} & NodeDataDependant, animationManager: AnimationManager, paths: Path[]): void;
export declare function pathFadeInAnimation<T>({ id }: {
    id: string;
}, subId: string, animationManager: AnimationManager, selection: Selection<Path, T>[] | Path[], phase?: 'add' | 'trailing'): void;
export declare function pathFadeOutAnimation<T>({ id }: {
    id: string;
}, subId: string, animationManager: AnimationManager, selection: Selection<Path, T>[] | Path[]): void;
export declare function buildResetPathFn(opts: {
    getOpacity(): number;
}): (_node: Path) => {
    opacity: number;
    clipScalingX: number;
    clipMode: undefined;
};
export declare function updateClipPath({ nodeDataDependencies }: NodeDataDependant, path: Path): void;

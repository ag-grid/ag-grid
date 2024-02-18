import type { NodeUpdateState } from '../../../motion/fromToMotion';
import type { Node } from '../../../scene/node';
import type { Selection } from '../../../scene/selection';
import type { AnimationManager } from '../../interaction/animationManager';
import type { Marker } from '../../marker/marker';
import type { NodeDataDependant } from '../seriesTypes';
import type { CartesianSeriesNodeDatum } from './cartesianSeries';
import type { PathNodeDatumLike, PathPointMap } from './pathUtil';
type NodeWithOpacity = Node & {
    opacity: number;
};
export declare function markerFadeInAnimation<T>({ id }: {
    id: string;
}, animationManager: AnimationManager, markerSelections: Selection<NodeWithOpacity, T>[], status?: NodeUpdateState): void;
export declare function markerScaleInAnimation<T>({ id }: {
    id: string;
}, animationManager: AnimationManager, markerSelections: Selection<Node, T>[]): void;
export declare function markerSwipeScaleInAnimation<T extends CartesianSeriesNodeDatum>({ id, nodeDataDependencies }: {
    id: string;
} & NodeDataDependant, animationManager: AnimationManager, markerSelections: Selection<Node, T>[]): void;
export declare function resetMarkerFn(_node: NodeWithOpacity & Node): {
    opacity: number;
    scalingX: number;
    scalingY: number;
};
export declare function resetMarkerPositionFn<T extends CartesianSeriesNodeDatum>(_node: Node, datum: T): {
    translationX: number;
    translationY: number;
};
export declare function prepareMarkerAnimation(pairMap: PathPointMap<any>, parentStatus: NodeUpdateState): {
    fromFn: (marker: Marker, datum: PathNodeDatumLike) => {
        opacity: number;
    } | {
        opacity: number;
        translationX: number | undefined;
        translationY: number | undefined;
        phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
    };
    toFn: (_marker: Marker, datum: PathNodeDatumLike) => {
        opacity: number;
    } | {
        translationX: number | undefined;
        translationY: number | undefined;
        opacity: number;
        phase: "trailing" | "end" | "initial" | "remove" | "update" | "add";
    };
};
export {};

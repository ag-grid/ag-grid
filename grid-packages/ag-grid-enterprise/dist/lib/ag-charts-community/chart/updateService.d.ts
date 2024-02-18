import type { BBox } from '../scene/bbox';
import { Listeners } from '../util/listeners';
import { ChartUpdateType } from './chartUpdateType';
import type { ISeries } from './series/seriesTypes';
type UpdateCallback = (type: ChartUpdateType, opts?: UpdateOpts) => void;
export interface UpdateCompleteEvent {
    type: 'update-complete';
    minRect?: BBox;
}
export type UpdateOpts = {
    forceNodeDataRefresh?: boolean;
    skipAnimations?: boolean;
    newAnimationBatch?: boolean;
    seriesToUpdate?: Iterable<ISeries<any>>;
    backOffMs?: number;
    skipSync?: boolean;
};
export declare class UpdateService extends Listeners<'update-complete', (event: UpdateCompleteEvent) => void> {
    private readonly updateCallback;
    constructor(updateCallback: UpdateCallback);
    update(type?: ChartUpdateType, options?: UpdateOpts): void;
    dispatchUpdateComplete(minRect?: BBox): void;
}
export {};

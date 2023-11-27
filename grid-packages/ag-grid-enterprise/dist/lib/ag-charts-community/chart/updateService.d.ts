import type { BBox } from '../scene/bbox';
import { Listeners } from '../util/listeners';
import { ChartUpdateType } from './chartUpdateType';
type UpdateCallback = (type: ChartUpdateType, options: {
    forceNodeDataRefresh?: boolean;
    skipAnimations?: boolean;
}) => void;
export interface UpdateCompleteEvent {
    type: 'update-complete';
    minRect?: BBox;
}
export declare class UpdateService extends Listeners<'update-complete', (event: UpdateCompleteEvent) => void> {
    private updateCallback;
    constructor(updateCallback: UpdateCallback);
    update(type?: ChartUpdateType, { forceNodeDataRefresh, skipAnimations }?: {
        forceNodeDataRefresh?: boolean | undefined;
        skipAnimations?: boolean | undefined;
    }): void;
    dispatchUpdateComplete(minRect?: BBox): void;
}
export {};

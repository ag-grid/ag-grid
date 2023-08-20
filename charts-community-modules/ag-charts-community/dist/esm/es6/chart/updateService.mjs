import { ChartUpdateType } from './chartUpdateType.mjs';
export class UpdateService {
    constructor(updateCallback) {
        this.updateCallback = updateCallback;
    }
    update(type = ChartUpdateType.FULL, { forceNodeDataRefresh = false } = {}) {
        this.updateCallback(type, { forceNodeDataRefresh });
    }
}

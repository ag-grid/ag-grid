import { ChartUpdateType } from './chartUpdateType';

type UpdateCallback = (type: ChartUpdateType, options: { forceNodeDataRefresh?: boolean }) => void;

export class UpdateService {
    private updateCallback: UpdateCallback;

    constructor(updateCallback: UpdateCallback) {
        this.updateCallback = updateCallback;
    }

    public update(type = ChartUpdateType.FULL, { forceNodeDataRefresh = false } = {}) {
        this.updateCallback(type, { forceNodeDataRefresh });
    }
}

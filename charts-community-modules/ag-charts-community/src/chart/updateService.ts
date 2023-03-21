import { ChartUpdateOptions } from './chart';
import { ChartUpdateType } from './chartUpdateType';

export class UpdateService {
    private updateCallback: (type: ChartUpdateType, opts?: ChartUpdateOptions) => void;

    constructor(updateCallback: (type: ChartUpdateType, opts?: ChartUpdateOptions) => void) {
        this.updateCallback = updateCallback;
    }

    public update(type = ChartUpdateType.FULL, opts?: ChartUpdateOptions) {
        this.updateCallback(type, opts);
    }
}

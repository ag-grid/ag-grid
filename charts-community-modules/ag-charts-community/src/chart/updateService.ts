import { ChartUpdateType } from './chartUpdateType';

export class UpdateService {
    private updateCallback: (type: ChartUpdateType) => void;

    constructor(updateCallback: (type: ChartUpdateType) => void) {
        this.updateCallback = updateCallback;
    }

    public update(type = ChartUpdateType.FULL) {
        this.updateCallback(type);
    }
}

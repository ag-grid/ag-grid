import { ChartUpdateType } from './chartUpdateType';
export class UpdateService {
    constructor(updateCallback) {
        this.updateCallback = updateCallback;
    }
    update(type = ChartUpdateType.FULL) {
        this.updateCallback(type);
    }
}

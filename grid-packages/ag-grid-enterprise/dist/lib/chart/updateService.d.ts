import { ChartUpdateType } from './chartUpdateType';
export declare class UpdateService {
    private updateCallback;
    constructor(updateCallback: (type: ChartUpdateType) => void);
    update(type?: ChartUpdateType): void;
}

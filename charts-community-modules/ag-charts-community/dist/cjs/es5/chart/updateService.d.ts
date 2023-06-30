import { ChartUpdateType } from './chartUpdateType';
declare type UpdateCallback = (type: ChartUpdateType, options: {
    forceNodeDataRefresh?: boolean;
}) => void;
export declare class UpdateService {
    private updateCallback;
    constructor(updateCallback: UpdateCallback);
    update(type?: ChartUpdateType, { forceNodeDataRefresh }?: {
        forceNodeDataRefresh?: boolean | undefined;
    }): void;
}
export {};
//# sourceMappingURL=updateService.d.ts.map
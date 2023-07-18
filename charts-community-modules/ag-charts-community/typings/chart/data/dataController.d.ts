import type { DataModelOptions, ProcessedData } from './dataModel';
import { DataModel } from './dataModel';
declare type Result<D extends object, K extends keyof D & string = keyof D & string, G extends boolean | undefined = undefined> = {
    processedData: ProcessedData<D>;
    dataModel: DataModel<D, K, G>;
};
/** Implements cross-series data model coordination. */
export declare class DataController {
    static DEBUG: () => boolean;
    private requested;
    private status;
    constructor();
    request<D extends object, K extends keyof D & string = keyof D & string, G extends boolean | undefined = undefined>(id: string, data: D[], opts: DataModelOptions<K, any>): Promise<Result<D, K, G>>;
    execute(): Promise<void>;
    private mergeRequested;
    private splitResult;
}
export {};
//# sourceMappingURL=dataController.d.ts.map
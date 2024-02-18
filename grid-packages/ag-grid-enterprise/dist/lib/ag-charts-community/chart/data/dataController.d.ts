import type { ChartMode } from '../chartMode';
import type { DataModelOptions, ProcessedData } from './dataModel';
import { DataModel } from './dataModel';
type Result<D extends object, K extends keyof D & string = keyof D & string, G extends boolean | undefined = undefined> = {
    processedData: ProcessedData<D>;
    dataModel: DataModel<D, K, G>;
};
/** Implements cross-series data model coordination. */
export declare class DataController {
    private readonly mode;
    private readonly debug;
    private requested;
    private status;
    constructor(mode: ChartMode);
    request<D extends object, K extends keyof D & string = keyof D & string, G extends boolean | undefined = undefined>(id: string, data: D[], opts: DataModelOptions<K, any>): Promise<Result<D, K, G>>;
    execute(): void;
    private extractScopedData;
    private validateRequests;
    private mergeRequested;
    private splitResult;
}
export {};

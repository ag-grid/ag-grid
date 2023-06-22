import { DataModel, DataModelOptions, ProcessedData } from './dataModel';

interface RequestedProcessing<
    D extends object,
    K extends keyof D & string = keyof D & string,
    G extends boolean | undefined = undefined
> {
    id: string;
    opts: DataModelOptions<K, any>;
    data: D[];
    resultCb: (result: Result<D, K, G>) => void;
    reject: (reason?: any) => void;
}

type Result<
    D extends object,
    K extends keyof D & string = keyof D & string,
    G extends boolean | undefined = undefined
> = { processedData: ProcessedData<D>; dataModel: DataModel<D, K, G> };

/** Implements cross-series data model coordination. */
export class DataController {
    private requested: RequestedProcessing<any, any, any>[] = [];
    private status: 'setup' | 'executed' = 'setup';

    public constructor() {}

    public async request<
        D extends object,
        K extends keyof D & string = keyof D & string,
        G extends boolean | undefined = undefined
    >(id: string, data: D[], opts: DataModelOptions<K, any>) {
        if (this.status !== 'setup') throw new Error(`AG Charts - data request after data setup phase.`);

        return new Promise<Result<D, K, G>>((resolve, reject) => {
            this.requested.push({
                id,
                opts,
                data,
                resultCb: resolve,
                reject,
            });
        });
    }

    public async execute() {
        if (this.status !== 'setup') throw new Error(`AG Charts - data request after data setup phase.`);

        this.status = 'executed';

        for (const { opts, data, resultCb, reject } of this.requested) {
            try {
                const dataModel = new DataModel<any>(opts);
                const processedData = dataModel.processData(data);
                if (processedData) {
                    resultCb({ dataModel, processedData });
                } else {
                    reject(new Error(`AG Charts - no processed data generated`));
                }
            } catch (error) {
                reject(error);
            }
        }
    }
}

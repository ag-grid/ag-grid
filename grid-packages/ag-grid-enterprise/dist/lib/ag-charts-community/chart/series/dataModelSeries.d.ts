import type { DataController } from '../data/dataController';
import type { DataModel, DataModelOptions, ProcessedData } from '../data/dataModel';
import type { SeriesNodeDataContext } from './series';
import { Series } from './series';
import type { SeriesNodeDatum } from './seriesTypes';
export declare abstract class DataModelSeries<TDatum extends SeriesNodeDatum, TLabel = TDatum, TContext extends SeriesNodeDataContext<TDatum, TLabel> = SeriesNodeDataContext<TDatum, TLabel>> extends Series<TDatum, TLabel, TContext> {
    protected dataModel?: DataModel<any, any, any>;
    protected processedData?: ProcessedData<any>;
    protected isContinuous(): {
        isContinuousX: boolean;
        isContinuousY: boolean;
    };
    private getModulePropertyDefinitions;
    protected requestDataModel<D extends object, K extends keyof D & string = keyof D & string, G extends boolean | undefined = undefined>(dataController: DataController, data: D[] | undefined, opts: DataModelOptions<K, boolean | undefined>): Promise<{
        dataModel: DataModel<D, K, G>;
        processedData: ProcessedData<D>;
    }>;
    protected isProcessedDataAnimatable(): boolean;
    protected checkProcessedDataAnimatable(): void;
}

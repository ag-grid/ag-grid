import type { DataModel, ProcessedData } from '../data/dataModel';
export type SeriesEventType = 'data-update' | 'data-processed' | 'visibility-changed';
export interface BaseSeriesEvent<_T extends SeriesEventType> {
}
export interface SeriesDataUpdateEvent extends BaseSeriesEvent<'data-update'> {
    readonly dataModel: DataModel<any, any, any>;
    readonly processedData: ProcessedData<any>;
}
export interface SeriesDataProcessedEvent extends BaseSeriesEvent<'data-processed'> {
    readonly dataModel: DataModel<any, any, any>;
    readonly processedData: ProcessedData<any>;
}
export interface SeriesVisibilityEvent extends BaseSeriesEvent<'visibility-changed'> {
    readonly itemId: any;
    readonly enabled: boolean;
}

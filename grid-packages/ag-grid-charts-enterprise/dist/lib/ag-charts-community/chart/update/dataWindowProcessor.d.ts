import type { DataService } from '../data/dataService';
import type { ZoomManager } from '../interaction/zoomManager';
import type { UpdateService } from '../updateService';
import type { ChartLike, UpdateProcessor } from './processor';
export declare class DataWindowProcessor<D extends object> implements UpdateProcessor {
    private readonly chart;
    private readonly dataService;
    private readonly updateService;
    private readonly zoomManager;
    private dirtyZoom;
    private dirtyDataSource;
    private lastAxisZooms;
    private destroyFns;
    constructor(chart: ChartLike, dataService: DataService<D>, updateService: UpdateService, zoomManager: ZoomManager);
    destroy(): void;
    private onDataLoad;
    private onDataError;
    private onDataSourceChange;
    private onUpdateComplete;
    private onZoomChange;
    private updateWindow;
    private getValidAxis;
    private shouldRefresh;
    private getAxisWindow;
}

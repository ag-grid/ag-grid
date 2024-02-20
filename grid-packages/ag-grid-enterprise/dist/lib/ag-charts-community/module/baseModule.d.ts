import type { DataController } from '../chart/data/dataController';
import type { BBox } from '../scene/bbox';
export interface ModuleInstance {
    processData?: (opts: {
        dataController: DataController;
    }) => Promise<void>;
    updateData?: (opts: {
        data: any;
    }) => Promise<void>;
    performLayout?: (opts: {
        shrinkRect: BBox;
    }) => Promise<{
        shrinkRect: BBox;
    }>;
    performCartesianLayout?: (opts: {
        seriesRect: BBox;
    }) => Promise<void>;
    destroy(): void;
}
export interface BaseModule {
    optionsKey: string;
    packageType: 'community' | 'enterprise';
    chartTypes: ('cartesian' | 'polar' | 'hierarchy')[];
    identifier?: string;
}

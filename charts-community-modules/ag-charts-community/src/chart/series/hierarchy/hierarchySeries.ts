import type { PointLabelDatum } from '../../../util/labelPlacement';
import type { ModuleContext } from '../../../util/moduleContext';
import type { HierarchyChart } from '../../hierarchyChart';
import type { SeriesNodeDatum, SeriesNodeDataContext } from '../series';
import { Series, SeriesNodePickMode } from '../series';

export abstract class HierarchySeries<S extends SeriesNodeDatum> extends Series<SeriesNodeDataContext<S>> {
    chart?: HierarchyChart;

    constructor(moduleCtx: ModuleContext) {
        super({ moduleCtx, pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] });
    }

    getLabelData(): PointLabelDatum[] {
        return [];
    }
}

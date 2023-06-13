import { PointLabelDatum } from '../../../util/labelPlacement';
import { ModuleContext } from '../../../util/moduleContext';
import { HierarchyChart } from '../../hierarchyChart';
import { Series, SeriesNodeDatum, SeriesNodeDataContext, SeriesNodePickMode } from '../series';

export abstract class HierarchySeries<S extends SeriesNodeDatum> extends Series<SeriesNodeDataContext<S>> {
    chart?: HierarchyChart;

    constructor(moduleCtx: ModuleContext) {
        super({ moduleCtx, pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] });
    }

    getLabelData(): PointLabelDatum[] {
        return [];
    }
}

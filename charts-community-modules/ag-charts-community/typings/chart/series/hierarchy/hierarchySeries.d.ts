import type { PointLabelDatum } from '../../../util/labelPlacement';
import type { ModuleContext } from '../../../util/moduleContext';
import type { HierarchyChart } from '../../hierarchyChart';
import type { SeriesNodeDatum, SeriesNodeDataContext } from '../series';
import { Series } from '../series';
export declare abstract class HierarchySeries<S extends SeriesNodeDatum> extends Series<SeriesNodeDataContext<S>> {
    chart?: HierarchyChart;
    constructor(moduleCtx: ModuleContext);
    getLabelData(): PointLabelDatum[];
}
//# sourceMappingURL=hierarchySeries.d.ts.map
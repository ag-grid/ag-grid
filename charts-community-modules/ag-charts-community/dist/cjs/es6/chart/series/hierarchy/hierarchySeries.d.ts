import { PointLabelDatum } from '../../../util/labelPlacement';
import { ModuleContext } from '../../../util/module';
import { HierarchyChart } from '../../hierarchyChart';
import { Series, SeriesNodeDatum, SeriesNodeDataContext } from '../series';
export declare abstract class HierarchySeries<S extends SeriesNodeDatum> extends Series<SeriesNodeDataContext<S>> {
    chart?: HierarchyChart;
    constructor(moduleCtx: ModuleContext);
    getLabelData(): PointLabelDatum[];
}
//# sourceMappingURL=hierarchySeries.d.ts.map
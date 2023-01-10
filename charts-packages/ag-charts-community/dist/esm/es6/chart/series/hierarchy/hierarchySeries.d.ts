import { PointLabelDatum } from '../../../util/labelPlacement';
import { HierarchyChart } from '../../hierarchyChart';
import { Series, SeriesNodeDatum, SeriesNodeDataContext } from '../series';
export declare abstract class HierarchySeries<S extends SeriesNodeDatum> extends Series<SeriesNodeDataContext<S>> {
    chart?: HierarchyChart;
    constructor();
    getLabelData(): PointLabelDatum[];
}

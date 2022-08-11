import { PointLabelDatum } from '../../../util/labelPlacement';
import { HierarchyChart } from '../../hierarchyChart';
import { Series, SeriesNodeDatum, SeriesNodeDataContext, SeriesNodePickMode } from '../series';

export abstract class HierarchySeries<S extends SeriesNodeDatum> extends Series<SeriesNodeDataContext<S>> {
    chart?: HierarchyChart;

    constructor() {
        super({ pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] });
    }

    getLabelData(): PointLabelDatum[] {
        return [];
    }
}

import type { SeriesNodeDatum, SeriesNodeDataContext } from '../series';
import { Series, SeriesNodePickMode } from '../series';
import type { BBox } from '../../../scene/bbox';
import type { PointLabelDatum } from '../../../util/labelPlacement';
import type { DataModel, ProcessedData } from '../../data/dataModel';
import type { ModuleContext } from '../../../util/moduleContext';
export declare abstract class PolarSeries<S extends SeriesNodeDatum> extends Series<SeriesNodeDataContext<S>> {
    /**
     * The center of the polar series (for example, the center of a pie).
     * If the polar chart has multiple series, all of them will have their
     * center set to the same value as a result of the polar chart layout.
     * The center coordinates are not supposed to be set by the user.
     */
    centerX: number;
    centerY: number;
    /**
     * The maximum radius the series can use.
     * This value is set automatically as a result of the polar chart layout
     * and is not supposed to be set by the user.
     */
    radius: number;
    protected dataModel?: DataModel<any, any, any>;
    protected processedData?: ProcessedData<any>;
    constructor({ moduleCtx, useLabelLayer, pickModes, }: {
        moduleCtx: ModuleContext;
        useLabelLayer?: boolean;
        pickModes?: SeriesNodePickMode[];
    });
    getLabelData(): PointLabelDatum[];
    computeLabelsBBox(_options: {
        hideWhenNecessary: boolean;
    }, _seriesRect: BBox): BBox | null;
}
//# sourceMappingURL=polarSeries.d.ts.map
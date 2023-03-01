import {
    Series,
    SeriesNodeDataContext,
    SeriesNodeDatum,
    SeriesNodePickMode,
    SeriesNodePickMatch,
    SeriesNodeBaseClickEvent,
} from '../series';
import { ChartAxis } from '../../chartAxis';
import { SeriesMarker } from '../seriesMarker';
import { doOnce } from '../../../util/function';
import { isContinuous, isDiscrete } from '../../../util/value';
import { ContinuousScale } from '../../../scale/continuousScale';
import { Path } from '../../../scene/shape/path';
import { Selection } from '../../../scene/selection';
import { Marker } from '../../marker/marker';
import { Group } from '../../../scene/group';
import { Text } from '../../../scene/shape/text';
import { Node } from '../../../scene/node';
import { RedrawType, SceneChangeDetection } from '../../../scene/changeDetectable';
import { CategoryAxis } from '../../axis/categoryAxis';
import { PointLabelDatum } from '../../../util/labelPlacement';
import { Layers } from '../../layers';
import { Point } from '../../../scene/point';
import { OPT_FUNCTION, Validate } from '../../../util/validation';
import { jsonDiff } from '../../../util/json';
import { BBox } from '../../../scene/bbox';
import { AgCartesianSeriesMarkerFormatterParams, AgCartesianSeriesMarkerFormat } from '../../agChartOptions';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';

type NodeDataSelection<N extends Node, ContextType extends SeriesNodeDataContext> = Selection<
    N,
    ContextType['nodeData'][number]
>;
type LabelDataSelection<N extends Node, ContextType extends SeriesNodeDataContext> = Selection<
    N,
    ContextType['labelData'][number]
>;

interface SubGroup<C extends SeriesNodeDataContext, SceneNodeType extends Node> {
    paths: Path[];
    dataNodeGroup: Group;
    labelGroup: Group;
    markerGroup?: Group;
    datumSelection: NodeDataSelection<SceneNodeType, C>;
    labelSelection: LabelDataSelection<Text, C>;
    markerSelection?: NodeDataSelection<Marker, C>;
}
interface SeriesOpts {
    pathsPerSeries: number;
    pathsZIndexSubOrderOffset: number[];
    hasMarkers: boolean;
    renderLayerPerSubSeries: boolean;
}

const DEFAULT_DIRECTION_KEYS: { [key in ChartAxisDirection]?: string[] } = {
    [ChartAxisDirection.X]: ['xKey'],
    [ChartAxisDirection.Y]: ['yKey'],
};

export class CartesianSeriesNodeBaseClickEvent<Datum extends { datum: any }> extends SeriesNodeBaseClickEvent<Datum> {
    readonly xKey: string;
    readonly yKey: string;

    constructor(xKey: string, yKey: string, nativeEvent: MouseEvent, datum: Datum, series: Series<any>) {
        super(nativeEvent, datum, series);
        this.xKey = xKey;
        this.yKey = yKey;
    }
}

export class CartesianSeriesNodeClickEvent<
    Datum extends { datum: any }
> extends CartesianSeriesNodeBaseClickEvent<Datum> {
    readonly type = 'nodeClick';
}
export class CartesianSeriesNodeDoubleClickEvent<
    Datum extends { datum: any }
> extends CartesianSeriesNodeBaseClickEvent<Datum> {
    readonly type = 'nodeDoubleClick';
}
export abstract class CartesianSeries<
    C extends SeriesNodeDataContext<any, any>,
    N extends Node = Group
> extends Series<C> {
    private _contextNodeData: C[] = [];
    get contextNodeData(): C[] {
        return this._contextNodeData?.slice();
    }

    private nodeDataDependencies: { seriesRectWidth?: number; seriesRectHeight?: number } = {};

    private highlightSelection = Selection.select(this.highlightNode, () =>
        this.opts.hasMarkers ? this.markerFactory() : (this.nodeFactory() as any)
    ) as NodeDataSelection<N, C>;
    private highlightLabelSelection = Selection.select(this.highlightLabel, Text) as LabelDataSelection<Text, C>;

    private subGroups: SubGroup<C, any>[] = [];
    private subGroupId: number = 0;

    private readonly opts: SeriesOpts;

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    protected readonly seriesItemEnabled = new Map<string, boolean>();

    protected constructor(
        opts: Partial<SeriesOpts> & {
            pickModes?: SeriesNodePickMode[];
            directionKeys?: { [key in ChartAxisDirection]?: string[] };
        } = {}
    ) {
        super({
            useSeriesGroupLayer: true,
            pickModes: opts.pickModes,
            directionKeys: opts.directionKeys ?? DEFAULT_DIRECTION_KEYS,
        });

        const {
            pathsPerSeries = 1,
            hasMarkers = false,
            pathsZIndexSubOrderOffset = [],
            renderLayerPerSubSeries = true,
        } = opts;
        this.opts = { pathsPerSeries, hasMarkers, pathsZIndexSubOrderOffset, renderLayerPerSubSeries };
    }

    destroy() {
        super.destroy();

        this._contextNodeData.splice(0, this._contextNodeData.length);
        this.subGroups.splice(0, this.subGroups.length);
    }

    /**
     * Note: we are passing `isContinuousX` and `isContinuousY` into this method because it will
     *       typically be called inside a loop and this check only needs to happen once.
     * @param x A domain value to be plotted along the x-axis.
     * @param y A domain value to be plotted along the y-axis.
     * @param isContinuousX Typically this will be the value of `xAxis.scale instanceof ContinuousScale`.
     * @param isContinuousY Typically this will be the value of `yAxis.scale instanceof ContinuousScale`.
     * @returns `[x, y]`, if both x and y are valid domain values for their respective axes/scales, or `undefined`.
     */
    protected checkDomainXY<T, K>(x: T, y: K, isContinuousX: boolean, isContinuousY: boolean): [T, K] | undefined {
        const isValidDatum =
            ((isContinuousX && isContinuous(x)) || (!isContinuousX && isDiscrete(x))) &&
            ((isContinuousY && isContinuous(y)) || (!isContinuousY && isDiscrete(y)));
        return isValidDatum ? [x, y] : undefined;
    }

    /**
     * Note: we are passing the xAxis and yAxis because the calling code is supposed to make sure
     *       that series has both of them defined, and also to avoid one level of indirection,
     *       e.g. `this.xAxis!.inRange(x)`, both of which are suboptimal in tight loops where this method is used.
     * @param x A range value to be plotted along the x-axis.
     * @param y A range value to be plotted along the y-axis.
     * @param xAxis The series' x-axis.
     * @param yAxis The series' y-axis.
     * @returns
     */
    protected checkRangeXY(x: number, y: number, xAxis: ChartAxis, yAxis: ChartAxis): boolean {
        return !isNaN(x) && !isNaN(y) && xAxis.inRange(x) && yAxis.inRange(y);
    }

    async update({ seriesRect }: { seriesRect?: BBox }) {
        const { seriesItemEnabled, visible } = this;
        const { series } = this.highlightManager?.getActiveHighlight() ?? {};
        const seriesHighlighted = series ? series === this : undefined;

        const anySeriesItemEnabled =
            (visible && seriesItemEnabled.size === 0) || [...seriesItemEnabled.values()].some((v) => v === true);

        const newNodeDataDependencies = {
            seriesRectWidth: seriesRect?.width,
            seriesRectHeight: seriesRect?.height,
        };
        if (jsonDiff(this.nodeDataDependencies, newNodeDataDependencies) != null) {
            this.nodeDataDependencies = newNodeDataDependencies;
            this.markNodeDataDirty();
        }

        await this.updateSelections(seriesHighlighted, anySeriesItemEnabled);
        await this.updateNodes(seriesHighlighted, anySeriesItemEnabled);
    }

    protected async updateSelections(seriesHighlighted: boolean | undefined, anySeriesItemEnabled: boolean) {
        await this.updateHighlightSelection(seriesHighlighted);

        if (!anySeriesItemEnabled) {
            return;
        }
        if (!this.nodeDataRefresh && !this.isPathOrSelectionDirty()) {
            return;
        }
        if (this.nodeDataRefresh) {
            this.nodeDataRefresh = false;

            this._contextNodeData = await this.createNodeData();
            await this.updateSeriesGroups();
        }

        await Promise.all(this.subGroups.map((g, i) => this.updateSeriesGroupSelections(g, i, seriesHighlighted)));
    }

    private async updateSeriesGroupSelections(
        subGroup: SubGroup<C, any>,
        seriesIdx: number,
        seriesHighlighted?: boolean
    ) {
        const { datumSelection, labelSelection, markerSelection, paths } = subGroup;
        const contextData = this._contextNodeData[seriesIdx];
        const { nodeData, labelData, itemId } = contextData;

        await this.updatePaths({ seriesHighlighted, itemId, contextData, paths, seriesIdx });
        subGroup.datumSelection = await this.updateDatumSelection({ nodeData, datumSelection, seriesIdx });
        subGroup.labelSelection = await this.updateLabelSelection({ labelData, labelSelection, seriesIdx });
        if (markerSelection) {
            subGroup.markerSelection = await this.updateMarkerSelection({
                nodeData,
                markerSelection,
                seriesIdx,
            });
        }
    }

    protected nodeFactory(): Node {
        return new Group();
    }

    protected markerFactory(): Marker {
        const MarkerShape = getMarker();
        return new MarkerShape();
    }

    private async updateSeriesGroups() {
        const {
            _contextNodeData: contextNodeData,
            contentGroup,
            subGroups,
            opts: { pathsPerSeries, hasMarkers, pathsZIndexSubOrderOffset, renderLayerPerSubSeries },
        } = this;
        if (contextNodeData.length === subGroups.length) {
            return;
        }

        if (contextNodeData.length < subGroups.length) {
            subGroups.splice(contextNodeData.length).forEach(({ dataNodeGroup, markerGroup, labelGroup, paths }) => {
                contentGroup.removeChild(dataNodeGroup);
                if (markerGroup) {
                    contentGroup.removeChild(markerGroup);
                }
                if (labelGroup) {
                    contentGroup.removeChild(labelGroup);
                }
                for (const path of paths) {
                    contentGroup.removeChild(path);
                }
            });
        }

        const totalGroups = contextNodeData.length;
        while (totalGroups > subGroups.length) {
            const layer = renderLayerPerSubSeries;
            const subGroupId = this.subGroupId++;
            const subGroupZOffset = subGroupId;
            const dataNodeGroup = new Group({
                name: `${this.id}-series-sub${subGroupId}-dataNodes`,
                layer,
                zIndex: Layers.SERIES_LAYER_ZINDEX,
                zIndexSubOrder: [this.id, subGroupZOffset],
            });
            const markerGroup = hasMarkers
                ? new Group({
                      name: `${this.id}-series-sub${this.subGroupId++}-markers`,
                      layer,
                      zIndex: Layers.SERIES_LAYER_ZINDEX,
                      zIndexSubOrder: [this.id, 10000 + subGroupId],
                  })
                : undefined;
            const labelGroup = new Group({
                name: `${this.id}-series-sub${this.subGroupId++}-labels`,
                layer,
                zIndex: Layers.SERIES_LABEL_ZINDEX,
                zIndexSubOrder: [this.id, subGroupId],
            });

            contentGroup.appendChild(dataNodeGroup);
            contentGroup.appendChild(labelGroup);
            if (markerGroup) {
                contentGroup.appendChild(markerGroup);
            }

            const pathParentGroup = renderLayerPerSubSeries ? dataNodeGroup : contentGroup;
            const paths: Path[] = [];
            for (let index = 0; index < pathsPerSeries; index++) {
                paths[index] = new Path();
                paths[index].zIndex = Layers.SERIES_LAYER_ZINDEX;
                paths[index].zIndexSubOrder = [this.id, (pathsZIndexSubOrderOffset[index] ?? 0) + subGroupZOffset];
                pathParentGroup.appendChild(paths[index]);
            }

            subGroups.push({
                paths,
                dataNodeGroup,
                markerGroup,
                labelGroup,
                labelSelection: Selection.select(labelGroup, Text),
                datumSelection: Selection.select(dataNodeGroup, () => this.nodeFactory()),
                markerSelection: markerGroup ? Selection.select(markerGroup, () => this.markerFactory()) : undefined,
            });
        }
    }

    protected async updateNodes(seriesHighlighted: boolean | undefined, anySeriesItemEnabled: boolean) {
        const {
            highlightSelection,
            highlightLabelSelection,
            _contextNodeData: contextNodeData,
            seriesItemEnabled,
            opts: { hasMarkers, renderLayerPerSubSeries },
        } = this;

        const visible = this.visible && this._contextNodeData?.length > 0 && anySeriesItemEnabled;
        this.rootGroup.visible = visible;
        this.contentGroup.visible = visible;
        this.highlightGroup.visible = visible && !!seriesHighlighted;

        const seriesOpacity = this.getOpacity();
        const subGroupOpacities = this.subGroups.map((_, index) => {
            const { itemId } = contextNodeData[index];
            return this.getOpacity({ itemId });
        });
        const isSubGroupOpacityDifferent = subGroupOpacities.some((subOp) => subOp !== seriesOpacity);
        this.contentGroup.opacity = isSubGroupOpacityDifferent ? 1 : seriesOpacity;

        if (hasMarkers) {
            await this.updateMarkerNodes({
                markerSelection: highlightSelection as any,
                isHighlight: true,
                seriesIdx: -1,
            });
        } else {
            await this.updateDatumNodes({ datumSelection: highlightSelection, isHighlight: true, seriesIdx: -1 });
        }
        await this.updateLabelNodes({ labelSelection: highlightLabelSelection, seriesIdx: -1 });

        await Promise.all(
            this.subGroups.map(async (subGroup, seriesIdx) => {
                const {
                    dataNodeGroup,
                    markerGroup,
                    datumSelection,
                    labelSelection,
                    markerSelection,
                    paths,
                    labelGroup,
                } = subGroup;
                const { itemId } = contextNodeData[seriesIdx];

                const subGroupVisible = visible && (seriesItemEnabled.get(itemId) ?? true);
                const subGroupOpacity = isSubGroupOpacityDifferent ? subGroupOpacities[seriesIdx] : 1;

                dataNodeGroup.opacity = subGroupOpacity;
                dataNodeGroup.visible = subGroupVisible;
                labelGroup.visible = subGroupVisible;

                if (markerGroup) {
                    markerGroup.opacity = subGroupOpacity;
                    markerGroup.zIndex =
                        dataNodeGroup.zIndex >= Layers.SERIES_LAYER_ZINDEX
                            ? dataNodeGroup.zIndex
                            : dataNodeGroup.zIndex + 1;
                    markerGroup.visible = subGroupVisible;
                }

                if (labelGroup) {
                    labelGroup.opacity = subGroupOpacity;
                }

                for (const path of paths) {
                    if (!renderLayerPerSubSeries) {
                        path.opacity = subGroupOpacity;
                        path.visible = subGroupVisible;
                    }
                }

                if (!dataNodeGroup.visible) {
                    return;
                }

                await this.updatePathNodes({ seriesHighlighted, itemId, paths, seriesIdx });
                await this.updateDatumNodes({ datumSelection, isHighlight: false, seriesIdx });
                await this.updateLabelNodes({ labelSelection, seriesIdx });
                if (hasMarkers && markerSelection) {
                    await this.updateMarkerNodes({ markerSelection, isHighlight: false, seriesIdx });
                }
            })
        );
    }

    protected async updateHighlightSelection(seriesHighlighted?: boolean) {
        const { highlightSelection, highlightLabelSelection, _contextNodeData: contextNodeData } = this;

        const highlightedDatum = this.highlightManager?.getActiveHighlight();
        const item =
            seriesHighlighted && highlightedDatum?.datum ? (highlightedDatum as C['nodeData'][number]) : undefined;
        this.highlightSelection = await this.updateHighlightSelectionItem({ item, highlightSelection });

        let labelItem: C['labelData'][number] | undefined;
        if (this.isLabelEnabled() && item != null) {
            const { itemId = undefined } = item;

            for (const { labelData } of contextNodeData) {
                labelItem = labelData.find((ld) => ld.datum === item.datum && ld.itemId === itemId);

                if (labelItem != null) {
                    break;
                }
            }
        }

        this.highlightLabelSelection = await this.updateHighlightSelectionLabel({
            item: labelItem,
            highlightLabelSelection,
        });
    }

    protected pickNodeExactShape(point: Point): SeriesNodePickMatch | undefined {
        const result = super.pickNodeExactShape(point);

        if (result) {
            return result;
        }

        const { x, y } = point;
        const {
            opts: { hasMarkers },
        } = this;

        for (const { dataNodeGroup, markerGroup } of this.subGroups) {
            let match = dataNodeGroup.pickNode(x, y);

            if (!match && hasMarkers) {
                match = markerGroup?.pickNode(x, y);
            }

            if (match) {
                return { datum: match.datum, distance: 0 };
            }
        }
    }

    protected pickNodeClosestDatum(point: Point): SeriesNodePickMatch | undefined {
        const { x, y } = point;
        const { xAxis, yAxis, rootGroup, _contextNodeData: contextNodeData } = this;
        const hitPoint = rootGroup.transformPoint(x, y);

        let minDistance = Infinity;
        let closestDatum: SeriesNodeDatum | undefined;

        for (const context of contextNodeData) {
            for (const datum of context.nodeData) {
                const { point: { x: datumX = NaN, y: datumY = NaN } = {} } = datum;
                if (isNaN(datumX) || isNaN(datumY)) {
                    continue;
                }

                const isInRange = xAxis?.inRange(datumX) && yAxis?.inRange(datumY);
                if (!isInRange) {
                    continue;
                }

                // No need to use Math.sqrt() since x < y implies Math.sqrt(x) < Math.sqrt(y) for
                // values > 1
                const distance = Math.max((hitPoint.x - datumX) ** 2 + (hitPoint.y - datumY) ** 2, 0);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestDatum = datum;
                }
            }
        }

        if (closestDatum) {
            const distance = Math.max(Math.sqrt(minDistance) - (closestDatum.point?.size ?? 0), 0);
            return { datum: closestDatum, distance };
        }
    }

    protected pickNodeMainAxisFirst(
        point: Point,
        requireCategoryAxis: boolean
    ): { datum: SeriesNodeDatum; distance: number } | undefined {
        const { x, y } = point;
        const { xAxis, yAxis, rootGroup, _contextNodeData: contextNodeData } = this;

        // Prefer to start search with any available category axis.
        const directions = [xAxis, yAxis]
            .filter((a): a is CategoryAxis => a instanceof CategoryAxis)
            .map((a) => a.direction);
        if (requireCategoryAxis && directions.length === 0) {
            return;
        }

        // Default to X-axis unless we found a suitable category axis.
        const [primaryDirection = ChartAxisDirection.X] = directions;

        const hitPoint = rootGroup.transformPoint(x, y);
        const hitPointCoords =
            primaryDirection === ChartAxisDirection.X ? [hitPoint.x, hitPoint.y] : [hitPoint.y, hitPoint.x];

        const minDistance = [Infinity, Infinity];
        let closestDatum: SeriesNodeDatum | undefined = undefined;

        for (const context of contextNodeData) {
            for (const datum of context.nodeData) {
                const { point: { x: datumX = NaN, y: datumY = NaN } = {} } = datum;
                if (isNaN(datumX) || isNaN(datumY)) {
                    continue;
                }

                const isInRange = xAxis?.inRange(datumX) && yAxis?.inRange(datumY);
                if (!isInRange) {
                    continue;
                }

                const point = primaryDirection === ChartAxisDirection.X ? [datumX, datumY] : [datumY, datumX];

                // Compare distances from most significant dimension to least.
                let newMinDistance = true;
                for (let i = 0; i < point.length; i++) {
                    const dist = Math.abs(point[i] - hitPointCoords[i]);
                    if (dist > minDistance[i]) {
                        newMinDistance = false;
                        break;
                    }
                    if (dist < minDistance[i]) {
                        minDistance[i] = dist;
                        minDistance.fill(Infinity, i + 1, minDistance.length);
                    }
                }

                if (newMinDistance) {
                    closestDatum = datum;
                }
            }
        }

        if (closestDatum) {
            const distance = Math.max(
                Math.sqrt(minDistance[0] ** 2 + minDistance[1] ** 2) - (closestDatum.point?.size ?? 0),
                0
            );
            return { datum: closestDatum, distance };
        }
    }

    toggleSeriesItem(itemId: string, enabled: boolean): void {
        if (this.seriesItemEnabled.size > 0) {
            this.seriesItemEnabled.set(itemId, enabled);
            this.nodeDataRefresh = true;
        } else {
            super.toggleSeriesItem(itemId, enabled);
        }
    }

    isEnabled() {
        if (this.seriesItemEnabled.size > 0) {
            for (const [, enabled] of this.seriesItemEnabled) {
                if (enabled) {
                    return true;
                }
            }
            return false;
        }

        return super.isEnabled();
    }

    protected isPathOrSelectionDirty(): boolean {
        // Override point to allow more sophisticated dirty selection detection.
        return false;
    }

    getLabelData(): PointLabelDatum[] {
        return [];
    }

    protected isAnySeriesVisible() {
        for (const visible of this.seriesItemEnabled.values()) {
            if (visible) {
                return true;
            }
        }
        return false;
    }

    protected validateXYData(
        xKey: string,
        yKey: string,
        data: any[],
        xAxis: ChartAxis,
        yAxis: ChartAxis,
        xData: number[],
        yData: any[],
        yDepth = 1
    ) {
        if (this.chart?.mode === 'integrated') {
            // Integrated Charts use-cases do not require this validation.
            return true;
        }

        if (!xAxis || !yAxis || data.length === 0 || (this.seriesItemEnabled.size > 0 && !this.isAnySeriesVisible())) {
            return true;
        }

        const hasNumber = (items: any[], depth = 0, maxDepth = 0): boolean => {
            return items.some(
                depth === maxDepth ? (y) => isContinuous(y) : (arr) => hasNumber(arr, depth + 1, maxDepth)
            );
        };

        const isContinuousX = xAxis.scale instanceof ContinuousScale;
        const isContinuousY = yAxis.scale instanceof ContinuousScale;

        let validationResult = true;
        if (isContinuousX && !hasNumber(xData)) {
            doOnce(
                () => console.warn(`AG Charts - The number axis has no numeric data supplied for xKey: [${xKey}].`),
                'series has no numeric data on number axis - ' + xKey
            );
            validationResult = false;
        }
        if (isContinuousY && !hasNumber(yData, 0, yDepth - 1)) {
            doOnce(
                () => console.warn(`AG Charts - The number axis has no numeric data supplied for yKey: [${yKey}].`),
                'series has no numeric data on number axis - ' + yKey
            );
            validationResult = false;
        }

        return validationResult;
    }

    protected async updatePaths(opts: {
        seriesHighlighted?: boolean;
        itemId?: string;
        contextData: C;
        paths: Path[];
        seriesIdx: number;
    }): Promise<void> {
        // Override point for sub-classes.
        opts.paths.forEach((p) => (p.visible = false));
    }

    protected async updatePathNodes(_opts: {
        seriesHighlighted?: boolean;
        itemId?: string;
        paths: Path[];
        seriesIdx: number;
    }): Promise<void> {
        // Override point for sub-classes.
    }

    protected async updateHighlightSelectionItem(opts: {
        item?: C['nodeData'][number];
        highlightSelection: NodeDataSelection<N, C>;
    }): Promise<NodeDataSelection<N, C>> {
        const {
            opts: { hasMarkers },
        } = this;

        const { item, highlightSelection } = opts;
        const nodeData = item ? [item] : [];

        if (hasMarkers) {
            const markerSelection = highlightSelection as any;
            return this.updateMarkerSelection({ nodeData, markerSelection, seriesIdx: -1 }) as any;
        } else {
            return this.updateDatumSelection({ nodeData, datumSelection: highlightSelection, seriesIdx: -1 });
        }
    }

    protected async updateHighlightSelectionLabel(opts: {
        item?: C['labelData'][number];
        highlightLabelSelection: LabelDataSelection<Text, C>;
    }): Promise<LabelDataSelection<Text, C>> {
        const { item, highlightLabelSelection } = opts;
        const labelData = item ? [item] : [];

        return this.updateLabelSelection({ labelData, labelSelection: highlightLabelSelection, seriesIdx: -1 });
    }

    protected async updateDatumSelection(opts: {
        nodeData: C['nodeData'];
        datumSelection: NodeDataSelection<N, C>;
        seriesIdx: number;
    }): Promise<NodeDataSelection<N, C>> {
        // Override point for sub-classes.
        return opts.datumSelection;
    }
    protected async updateDatumNodes(_opts: {
        datumSelection: NodeDataSelection<N, C>;
        isHighlight: boolean;
        seriesIdx: number;
    }): Promise<void> {
        // Override point for sub-classes.
    }

    protected async updateMarkerSelection(opts: {
        nodeData: C['nodeData'];
        markerSelection: NodeDataSelection<Marker, C>;
        seriesIdx: number;
    }): Promise<NodeDataSelection<Marker, C>> {
        // Override point for sub-classes.
        return opts.markerSelection;
    }
    protected async updateMarkerNodes(_opts: {
        markerSelection: NodeDataSelection<Marker, C>;
        isHighlight: boolean;
        seriesIdx: number;
    }): Promise<void> {
        // Override point for sub-classes.
    }

    protected abstract updateLabelSelection(opts: {
        labelData: C['labelData'];
        labelSelection: LabelDataSelection<Text, C>;
        seriesIdx: number;
    }): Promise<LabelDataSelection<Text, C>>;
    protected abstract updateLabelNodes(opts: {
        labelSelection: LabelDataSelection<Text, C>;
        seriesIdx: number;
    }): Promise<void>;

    protected abstract isLabelEnabled(): boolean;
}

export class CartesianSeriesMarker extends SeriesMarker {
    @Validate(OPT_FUNCTION)
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    formatter?: (params: AgCartesianSeriesMarkerFormatterParams<any>) => AgCartesianSeriesMarkerFormat = undefined;
}

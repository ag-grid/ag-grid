import type { Scale } from './scale/scale';
import type { Node } from './scene/node';
import { Group } from './scene/group';
import { Selection } from './scene/selection';
import { Line } from './scene/shape/line';
import type { TextSizeProperties } from './scene/shape/text';
import { measureText, Text, splitText } from './scene/shape/text';
import type { Arc } from './scene/shape/arc';
import { BBox } from './scene/bbox';
import { Caption } from './caption';
import { createId } from './util/id';
import { normalizeAngle360, toRadians } from './util/angle';
import { areArrayNumbersEqual } from './util/equal';
import type { CrossLine } from './chart/crossline/crossLine';
import { Validate, BOOLEAN, ARRAY, STRING_ARRAY, predicateWithMessage } from './util/validation';
import { Layers } from './chart/layers';
import type { PointLabelDatum } from './util/labelPlacement';
import { axisLabelsOverlap } from './util/labelPlacement';
import { ContinuousScale } from './scale/continuousScale';
import { Matrix } from './scene/matrix';
import { TimeScale } from './scale/timeScale';
import type { AgAxisCaptionFormatterParams, AgAxisGridStyle, TextWrap } from './chart/agChartOptions';
import { LogScale } from './scale/logScale';
import { extent } from './util/array';
import { ChartAxisDirection } from './chart/chartAxisDirection';
import type { Flag } from './chart/label';
import {
    calculateLabelRotation,
    calculateLabelBBox,
    getLabelSpacing,
    getTextAlign,
    getTextBaseline,
} from './chart/label';
import { Logger } from './util/logger';
import type { AxisLayout } from './chart/layout/layoutService';
import type { AxisOptionModule, ModuleInstance } from './util/module';
import type { AxisContext, ModuleContext } from './util/moduleContext';
import { AxisLabel } from './chart/axis/axisLabel';
import { AxisLine } from './chart/axis/axisLine';
import type { AxisTitle } from './chart/axis/axisTitle';
import type { TickCount, TickInterval } from './chart/axis/axisTick';
import { AxisTick } from './chart/axis/axisTick';
import type { ChartAxis, BoundSeries } from './chart/chartAxis';
import type { AnimationManager } from './chart/interaction/animationManager';
import type { InteractionEvent } from './chart/interaction/interactionManager';
import * as easing from './motion/easing';
import { StateMachine } from './motion/states';

const GRID_STYLE_KEYS = ['stroke', 'lineDash'];
const GRID_STYLE = predicateWithMessage(
    ARRAY(undefined, (o) => {
        for (const key in o) {
            if (!GRID_STYLE_KEYS.includes(key)) {
                return false;
            }
        }
        return true;
    }),
    `expecting an Array of objects with gridline style properties such as 'stroke' and 'lineDash'`
);

export enum Tags {
    TickLine,
    TickLabel,
    GridLine,
    GridArc,
    AxisLine,
}

type TickStrategyParams = {
    index: number;
    tickData: TickData;
    textProps: TextSizeProperties;
    labelOverlap: boolean;
    terminate: boolean;
    primaryTickCount?: number;
};

type TickStrategyResult = {
    index: number;
    tickData: TickData;
    autoRotation: number;
    terminate: boolean;
};

type TickStrategy = (params: TickStrategyParams) => TickStrategyResult;

enum TickGenerationType {
    CREATE,
    CREATE_SECONDARY,
    FILTER,
    VALUES,
}

type TickDatum = {
    tickLabel: string;
    tick: any;
    tickId: string;
    translationY: number;
};

type TickData = { rawTicks: any[]; ticks: TickDatum[]; labelCount: number };

type AxisAnimationState = 'empty' | 'align' | 'ready';
type AxisAnimationEvent = 'update';
class AxisStateMachine extends StateMachine<AxisAnimationState, AxisAnimationEvent> {}
type AxisUpdateDiff = {
    changed: boolean;
    tickCount: number;
    added: { [key: string]: true };
    removed: { [key: string]: true };
};

/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be {@link rotation | rotated} by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
 * The generic `D` parameter is the type of the domain of the axis' scale.
 * The output range of the axis' scale is always numeric (screen coordinates).
 */
export abstract class Axis<S extends Scale<D, number, TickInterval<S>> = Scale<any, number, any>, D = any>
    implements ChartAxis
{
    static readonly defaultTickMinSpacing = 50;

    readonly id = createId(this);

    @Validate(BOOLEAN)
    nice: boolean = true;

    dataDomain: D[] = [];

    protected _scale: S;
    get scale(): S {
        return this._scale;
    }

    @Validate(STRING_ARRAY)
    keys: string[] = [];

    get type(): string {
        return (this.constructor as any).type ?? '';
    }

    abstract get direction(): ChartAxisDirection;

    boundSeries: BoundSeries[] = [];
    linkedTo?: Axis<any, any>;
    includeInvisibleDomains: boolean = false;

    readonly axisGroup = new Group({ name: `${this.id}-axis`, zIndex: Layers.AXIS_ZINDEX });

    protected lineNode = this.axisGroup.appendChild(new Line());
    protected readonly tickLineGroup = this.axisGroup.appendChild(
        new Group({ name: `${this.id}-Axis-tick-lines`, zIndex: Layers.AXIS_ZINDEX })
    );
    protected readonly tickLabelGroup = this.axisGroup.appendChild(
        new Group({ name: `${this.id}-Axis-tick-labels`, zIndex: Layers.AXIS_ZINDEX })
    );
    protected readonly crossLineGroup: Group = new Group({ name: `${this.id}-CrossLines` });

    readonly gridGroup = new Group({ name: `${this.id}-Axis-grid` });
    protected readonly gridLineGroup = this.gridGroup.appendChild(
        new Group({
            name: `${this.id}-gridLines`,
            zIndex: Layers.AXIS_GRID_ZINDEX,
        })
    );

    protected tickLineGroupSelection = Selection.select(this.tickLineGroup, Line, false);
    protected tickLabelGroupSelection = Selection.select(this.tickLabelGroup, Text, false);
    protected gridLineGroupSelection = Selection.select(this.gridLineGroup, Line, false);

    protected abstract assignCrossLineArrayConstructor(crossLines: CrossLine[]): void;

    private _crossLines?: CrossLine[];
    set crossLines(value: CrossLine[] | undefined) {
        this._crossLines?.forEach((crossLine) => this.detachCrossLine(crossLine));

        if (value) {
            this.assignCrossLineArrayConstructor(value);
        }

        this._crossLines = value;

        this._crossLines?.forEach((crossLine) => {
            this.attachCrossLine(crossLine);
            this.initCrossLine(crossLine);
        });
    }
    get crossLines(): CrossLine[] | undefined {
        return this._crossLines;
    }

    readonly line = new AxisLine();
    readonly tick: AxisTick<S> = this.createTick();
    readonly label = new AxisLabel();

    readonly translation = { x: 0, y: 0 };
    rotation: number = 0; // axis rotation angle in degrees

    protected readonly layout: Pick<AxisLayout, 'label'> = {
        label: {
            fractionDigits: 0,
            padding: this.label.padding,
            format: this.label.format,
        },
    };

    protected axisContext?: AxisContext;

    protected readonly modules: Record<string, { instance: ModuleInstance }> = {};

    private animationManager: AnimationManager;
    private animationState: AxisStateMachine;

    private destroyFns: Function[] = [];

    constructor(protected readonly moduleCtx: ModuleContext, scale: S) {
        this._scale = scale;
        this.refreshScale();

        this._titleCaption.node.rotation = -Math.PI / 2;
        this.axisGroup.appendChild(this._titleCaption.node);

        const axisHoverHandle = moduleCtx.interactionManager.addListener('hover', (e) => this.checkAxisHover(e));
        this.destroyFns.push(() => moduleCtx.interactionManager.removeListener(axisHoverHandle));

        this.animationManager = moduleCtx.animationManager;
        this.animationState = new AxisStateMachine('empty', {
            empty: {
                on: {
                    update: {
                        target: 'align',
                        action: () => this.resetSelectionNodes(),
                    },
                },
            },
            align: {
                on: {
                    update: {
                        target: 'ready',
                        action: () => this.resetSelectionNodes(),
                    },
                },
            },
            ready: {
                on: {
                    update: {
                        target: 'ready',
                        action: (data: AxisUpdateDiff) => this.animateReadyUpdate(data),
                    },
                },
            },
        });

        this._crossLines = [];
        this.assignCrossLineArrayConstructor(this._crossLines);
    }

    private attachCrossLine(crossLine: CrossLine) {
        this.crossLineGroup.appendChild(crossLine.group);
    }

    private detachCrossLine(crossLine: CrossLine) {
        this.crossLineGroup.removeChild(crossLine.group);
    }

    destroy() {
        for (const [key, module] of Object.entries(this.modules)) {
            module.instance.destroy();
            delete this.modules[key];
            delete (this as any)[key];
        }
        this.destroyFns.forEach((f) => f());
    }

    protected refreshScale() {
        this.range = this.scale.range.slice();
        this.crossLines?.forEach((crossLine) => {
            this.initCrossLine(crossLine);
        });
    }

    protected updateRange() {
        const { range: rr, visibleRange: vr, scale } = this;
        const span = (rr[1] - rr[0]) / (vr[1] - vr[0]);
        const shift = span * vr[0];
        const start = rr[0] - shift;

        scale.range = [start, start + span];
        this.crossLines?.forEach((crossLine) => {
            crossLine.clippedRange = [rr[0], rr[1]];
        });
    }

    setCrossLinesVisible(visible: boolean) {
        this.crossLineGroup.visible = visible;
    }

    attachAxis(node: Node) {
        node.appendChild(this.gridGroup);
        node.appendChild(this.axisGroup);
        node.appendChild(this.crossLineGroup);
    }

    detachAxis(node: Node) {
        node.removeChild(this.gridGroup);
        node.removeChild(this.axisGroup);
        node.removeChild(this.crossLineGroup);
    }

    /**
     * Checks if a point or an object is in range.
     * @param x A point (or object's starting point).
     * @param width Object's width.
     * @param tolerance Expands the range on both ends by this amount.
     */
    inRange(x: number, width = 0, tolerance = 0): boolean {
        return this.inRangeEx(x, width, tolerance) === 0;
    }

    inRangeEx(x: number, width = 0, tolerance = 0): -1 | 0 | 1 {
        const { range } = this;
        // Account for inverted ranges, for example [500, 100] as well as [100, 500]
        const min = Math.min(range[0], range[1]);
        const max = Math.max(range[0], range[1]);
        if (x + width < min - tolerance) {
            return -1; // left of range
        }
        if (x > max + tolerance) {
            return 1; // right of range
        }
        return 0; // in range
    }

    range: number[] = [0, 1];
    visibleRange: number[] = [0, 1];

    protected labelFormatter?: (datum: any) => string;
    protected onLabelFormatChange(ticks: any[], format?: string) {
        const { scale, fractionDigits } = this;
        const logScale = scale instanceof LogScale;

        const defaultLabelFormatter =
            !logScale && fractionDigits > 0
                ? (x: any) => (typeof x === 'number' ? x.toFixed(fractionDigits) : String(x))
                : (x: any) => String(x);

        if (format && scale && scale.tickFormat) {
            try {
                this.labelFormatter = scale.tickFormat({
                    ticks,
                    specifier: format,
                });
            } catch (e) {
                this.labelFormatter = defaultLabelFormatter;
                Logger.warnOnce(`the axis label format string ${format} is invalid. No formatting will be applied`);
            }
        } else {
            this.labelFormatter = defaultLabelFormatter;
        }
    }

    public title: AxisTitle | undefined = undefined;
    protected _titleCaption = new Caption();

    private setDomain() {
        const {
            scale,
            dataDomain,
            tick: { values: tickValues },
        } = this;
        if (tickValues && scale instanceof ContinuousScale) {
            const [tickMin, tickMax] = extent(tickValues) ?? [Infinity, -Infinity];
            const min = Math.min(scale.fromDomain(dataDomain[0]), tickMin);
            const max = Math.max(scale.fromDomain(dataDomain[1]), tickMax);
            scale.domain = [scale.toDomain(min), scale.toDomain(max)];
        } else {
            scale.domain = dataDomain;
        }
    }

    private setTickInterval(interval?: TickInterval<S>) {
        this.scale.interval = this.tick.interval ?? interval;
    }

    private setTickCount(count?: TickCount<S> | number, minTickCount?: number, maxTickCount?: number) {
        const { scale } = this;
        if (!(count && scale instanceof ContinuousScale)) {
            return;
        }

        if (typeof count === 'number') {
            scale.tickCount = count;
            scale.minTickCount = minTickCount ?? 0;
            scale.maxTickCount = maxTickCount ?? Infinity;
            return;
        }

        if (scale instanceof TimeScale) {
            this.setTickInterval(count);
        }
    }

    /**
     * The length of the grid. The grid is only visible in case of a non-zero value.
     * In case {@link radialGrid} is `true`, the value is interpreted as an angle
     * (in degrees).
     */
    protected _gridLength: number = 0;
    set gridLength(value: number) {
        // Was visible and now invisible, or was invisible and now visible.
        if ((this._gridLength && !value) || (!this._gridLength && value)) {
            this.gridLineGroupSelection = this.gridLineGroupSelection.clear();
        }

        this._gridLength = value;

        this.crossLines?.forEach((crossLine) => {
            this.initCrossLine(crossLine);
        });
    }
    get gridLength(): number {
        return this._gridLength;
    }

    /**
     * The array of styles to cycle through when rendering grid lines.
     * For example, use two {@link GridStyle} objects for alternating styles.
     * Contains only one {@link GridStyle} object by default, meaning all grid lines
     * have the same style.
     */
    @Validate(GRID_STYLE)
    gridStyle: AgAxisGridStyle[] = [
        {
            stroke: 'rgba(219, 219, 219, 1)',
            lineDash: [4, 2],
        },
    ];

    private fractionDigits = 0;

    /**
     * The distance between the grid ticks and the axis ticks.
     */
    gridPadding = 0;

    /**
     * Is used to avoid collisions between axis labels and series.
     */
    seriesAreaPadding = 0;

    protected createTick(): AxisTick<S> {
        return new AxisTick();
    }

    private checkAxisHover(event: InteractionEvent<'hover'>) {
        const bbox = this.computeBBox();
        const isInAxis = bbox.containsPoint(event.offsetX, event.offsetY);

        if (!isInAxis) return;

        this.moduleCtx.chartEventManager.axisHover(this.id, this.direction);
    }

    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    update(primaryTickCount?: number): number | undefined {
        const previous = this.tickLabelGroupSelection.nodes().map((node) => node.datum.tickId);

        const { rotation, parallelFlipRotation, regularFlipRotation } = this.calculateRotations();
        const sideFlag = this.label.getSideFlag();
        const labelX = sideFlag * (this.tick.size + this.label.padding + this.seriesAreaPadding);

        this.updateScale();
        this.updatePosition({ rotation, sideFlag });
        this.updateLine();

        const { tickData, combinedRotation, textBaseline, textAlign, ...ticksResult } = this.generateTicks({
            primaryTickCount,
            parallelFlipRotation,
            regularFlipRotation,
            labelX,
            sideFlag,
        });

        this.updateSelections(tickData.ticks);

        if (this.animationManager.skipAnimations) {
            this.resetSelectionNodes();
        } else {
            const diff = this.calculateUpdateDiff(previous, tickData);
            this.animationState.transition('update', diff);
        }

        this.updateLabels({
            tickLabelGroupSelection: this.tickLabelGroupSelection,
            combinedRotation,
            textBaseline,
            textAlign,
            labelX,
        });

        this.updateVisibility();
        this.updateGridLines(sideFlag);
        this.updateTickLines(sideFlag);
        this.updateTitle({ anyTickVisible: tickData.ticks.length > 0, sideFlag });
        this.updateCrossLines({ rotation, parallelFlipRotation, regularFlipRotation, sideFlag });
        this.updateLayoutState();

        primaryTickCount = ticksResult.primaryTickCount;
        return primaryTickCount;
    }

    private updateLayoutState() {
        this.layout.label = {
            fractionDigits: this.fractionDigits,
            padding: this.label.padding,
            format: this.label.format,
        };
    }

    updateScale() {
        this.updateRange();
        this.calculateDomain();
        this.setDomain();
        this.setTickInterval(this.tick.interval);

        const { scale, nice } = this;
        if (!(scale instanceof ContinuousScale)) {
            return;
        }

        this.setTickCount(this.tick.count);

        scale.nice = nice;
        scale.update();
    }

    private calculateRotations() {
        const rotation = toRadians(this.rotation);
        // When labels are parallel to the axis line, the `parallelFlipFlag` is used to
        // flip the labels to avoid upside-down text, when the axis is rotated
        // such that it is in the right hemisphere, i.e. the angle of rotation
        // is in the [0, π] interval.
        // The rotation angle is normalized, so that we have an easier time checking
        // if it's in the said interval. Since the axis is always rendered vertically
        // and then rotated, zero rotation means 12 (not 3) o-clock.
        // -1 = flip
        //  1 = don't flip (default)
        const parallelFlipRotation = normalizeAngle360(rotation);
        const regularFlipRotation = normalizeAngle360(rotation - Math.PI / 2);
        return { rotation, parallelFlipRotation, regularFlipRotation };
    }

    private generateTicks({
        primaryTickCount,
        parallelFlipRotation,
        regularFlipRotation,
        labelX,
        sideFlag,
    }: {
        primaryTickCount?: number;
        parallelFlipRotation: number;
        regularFlipRotation: number;
        labelX: number;
        sideFlag: Flag;
    }): {
        tickData: TickData;
        primaryTickCount?: number;
        combinedRotation: number;
        textBaseline: CanvasTextBaseline;
        textAlign: CanvasTextAlign;
    } {
        const {
            scale,
            tick,
            label: { parallel, rotation, fontFamily, fontSize, fontStyle, fontWeight },
        } = this;

        const secondaryAxis = primaryTickCount !== undefined;

        const { defaultRotation, configuredRotation, parallelFlipFlag, regularFlipFlag } = calculateLabelRotation({
            rotation,
            parallel,
            regularFlipRotation,
            parallelFlipRotation,
        });

        const initialRotation = configuredRotation + defaultRotation;
        const labelMatrix = new Matrix();

        const { maxTickCount } = this.estimateTickCount({
            minSpacing: tick.minSpacing,
            maxSpacing: tick.maxSpacing ?? NaN,
        });

        const continuous = scale instanceof ContinuousScale;
        const maxIterations = tick.count || !continuous || isNaN(maxTickCount) ? 10 : maxTickCount;

        let textAlign = getTextAlign(parallel, configuredRotation, 0, sideFlag, regularFlipFlag);
        const textBaseline = getTextBaseline(parallel, configuredRotation, sideFlag, parallelFlipFlag);

        const textProps: TextSizeProperties = {
            fontFamily,
            fontSize,
            fontStyle,
            fontWeight,
            textBaseline,
            textAlign,
        };

        let tickData: TickData = {
            rawTicks: [],
            ticks: [],
            labelCount: 0,
        };

        let index = 0;
        let autoRotation = 0;
        let labelOverlap = true;
        let terminate = false;
        while (labelOverlap && index <= maxIterations) {
            if (terminate) {
                break;
            }
            autoRotation = 0;
            textAlign = getTextAlign(parallel, configuredRotation, 0, sideFlag, regularFlipFlag);

            const tickStrategies = this.getTickStrategies({ secondaryAxis, index });

            for (const strategy of tickStrategies) {
                ({ tickData, index, autoRotation, terminate } = strategy({
                    index,
                    tickData,
                    textProps,
                    labelOverlap,
                    terminate,
                    primaryTickCount,
                }));

                const ticksResult = tickData.ticks;

                textAlign = getTextAlign(parallel, configuredRotation, autoRotation, sideFlag, regularFlipFlag);
                const rotated = configuredRotation !== 0 || autoRotation !== 0;
                const rotation = initialRotation + autoRotation;
                labelOverlap = this.checkLabelOverlap(rotation, rotated, labelMatrix, ticksResult, labelX, {
                    ...textProps,
                    textAlign,
                });
            }
        }

        const combinedRotation = defaultRotation + configuredRotation + autoRotation;

        if (!secondaryAxis && tickData.rawTicks.length > 0) {
            primaryTickCount = tickData.rawTicks.length;
        }

        return { tickData, primaryTickCount, combinedRotation, textBaseline, textAlign };
    }

    private getTickStrategies({ index, secondaryAxis }: { index: number; secondaryAxis: boolean }): TickStrategy[] {
        const { scale, label, tick } = this;
        const continuous = scale instanceof ContinuousScale;
        const avoidLabelCollisions = label.enabled && label.avoidCollisions;
        const filterTicks = !(continuous && this.tick.count === undefined) && index !== 0 && avoidLabelCollisions;
        const autoRotate = label.autoRotate === true && label.rotation === undefined;

        const strategies: TickStrategy[] = [];
        let tickGenerationType: TickGenerationType;
        if (this.tick.values) {
            tickGenerationType = TickGenerationType.VALUES;
        } else if (secondaryAxis) {
            tickGenerationType = TickGenerationType.CREATE_SECONDARY;
        } else if (filterTicks) {
            tickGenerationType = TickGenerationType.FILTER;
        } else {
            tickGenerationType = TickGenerationType.CREATE;
        }

        const tickGenerationStrategy = ({ index, tickData, primaryTickCount, terminate }: TickStrategyParams) =>
            this.createTickData(tickGenerationType, index, tickData, terminate, primaryTickCount);

        strategies.push(tickGenerationStrategy);

        if (!continuous && !isNaN(tick.minSpacing)) {
            const tickFilterStrategy = ({ index, tickData, primaryTickCount, terminate }: TickStrategyParams) =>
                this.createTickData(TickGenerationType.FILTER, index, tickData, terminate, primaryTickCount);
            strategies.push(tickFilterStrategy);
        }

        if (!avoidLabelCollisions) {
            return strategies;
        }

        if (label.autoWrap) {
            const autoWrapStrategy = ({ index, tickData, textProps }: TickStrategyParams) =>
                this.wrapLabels(tickData, index, textProps);

            strategies.push(autoWrapStrategy);
        } else if (autoRotate) {
            const autoRotateStrategy = ({ index, tickData, labelOverlap, terminate }: TickStrategyParams) => ({
                index,
                tickData,
                autoRotation: this.getAutoRotation(labelOverlap),
                terminate,
            });

            strategies.push(autoRotateStrategy);
        }

        return strategies;
    }

    createTickData(
        tickGenerationType: TickGenerationType,
        index: number,
        tickData: TickData,
        terminate: boolean,
        primaryTickCount?: number
    ): TickStrategyResult {
        const { scale, tick } = this;
        const { maxTickCount, minTickCount, defaultTickCount } = this.estimateTickCount({
            minSpacing: tick.minSpacing,
            maxSpacing: tick.maxSpacing ?? NaN,
        });

        const continuous = scale instanceof ContinuousScale;
        const maxIterations = tick.count || !continuous || isNaN(maxTickCount) ? 10 : maxTickCount;

        let tickCount = tick.count ?? (continuous ? Math.max(defaultTickCount - index, minTickCount) : maxTickCount);

        const regenerateTicks =
            tick.interval === undefined &&
            tick.values === undefined &&
            tick.count === undefined &&
            tickCount > minTickCount &&
            (continuous || tickGenerationType === TickGenerationType.FILTER);

        let unchanged = true;
        while (unchanged && index <= maxIterations) {
            const prevTicks = tickData.rawTicks;
            tickCount = tick.count ?? (continuous ? Math.max(defaultTickCount - index, minTickCount) : maxTickCount);

            const { rawTicks, ticks, labelCount } = this.getTicks({
                tickGenerationType,
                previousTicks: prevTicks,
                tickCount,
                minTickCount,
                maxTickCount,
                primaryTickCount,
            });

            tickData.rawTicks = rawTicks;
            tickData.ticks = ticks;
            tickData.labelCount = labelCount;

            unchanged = regenerateTicks ? areArrayNumbersEqual(rawTicks, prevTicks) : false;
            index++;
        }

        const shouldTerminate = tick.interval !== undefined || tick.values !== undefined;

        terminate ||= shouldTerminate;

        return { tickData, index, autoRotation: 0, terminate };
    }

    private checkLabelOverlap(
        rotation: number,
        rotated: boolean,
        labelMatrix: Matrix,
        tickData: TickDatum[],
        labelX: number,
        textProps: TextSizeProperties
    ): boolean {
        Matrix.updateTransformMatrix(labelMatrix, 1, 1, rotation, 0, 0);

        const labelData: PointLabelDatum[] = this.createLabelData(tickData, labelX, textProps, labelMatrix);
        const labelSpacing = getLabelSpacing(this.label.minSpacing, rotated);

        return axisLabelsOverlap(labelData, labelSpacing);
    }

    private createLabelData(
        tickData: TickDatum[],
        labelX: number,
        textProps: TextSizeProperties,
        labelMatrix: Matrix
    ): PointLabelDatum[] {
        const labelData: PointLabelDatum[] = [];
        for (const tickDatum of tickData) {
            const { tickLabel, translationY } = tickDatum;
            if (tickLabel === '' || tickLabel == undefined) {
                // skip user hidden ticks
                continue;
            }

            const lines = splitText(tickLabel);

            const { width, height } = measureText(lines, labelX, translationY, textProps);

            const bbox = new BBox(labelX, translationY, width, height);

            const labelDatum = calculateLabelBBox(tickLabel, bbox, labelX, translationY, labelMatrix);

            labelData.push(labelDatum);
        }
        return labelData;
    }

    private getAutoRotation(labelOveralap: boolean): number {
        return labelOveralap ? normalizeAngle360(toRadians(this.label.autoRotateAngle)) : 0;
    }

    private getTicks({
        tickGenerationType,
        previousTicks,
        tickCount,
        minTickCount,
        maxTickCount,
        primaryTickCount,
    }: {
        tickGenerationType: TickGenerationType;
        previousTicks: TickDatum[];
        tickCount: number;
        minTickCount: number;
        maxTickCount: number;
        primaryTickCount?: number;
    }) {
        const { scale } = this;

        let rawTicks: any[] = [];

        switch (tickGenerationType) {
            case TickGenerationType.VALUES:
                rawTicks = this.tick.values!;
                break;
            case TickGenerationType.CREATE_SECONDARY:
                // `updateSecondaryAxisTicks` mutates `scale.domain` based on `primaryTickCount`
                rawTicks = this.updateSecondaryAxisTicks(primaryTickCount);
                break;
            case TickGenerationType.FILTER:
                rawTicks = this.filterTicks(previousTicks, tickCount);
                break;
            default:
                rawTicks = this.createTicks(tickCount, minTickCount, maxTickCount);
                break;
        }

        // When the scale domain or the ticks change, the label format may change
        this.onLabelFormatChange(rawTicks, this.label.format);
        // `ticks instanceof NumericTicks` doesn't work here, so we feature detect.
        this.fractionDigits = (rawTicks as any).fractionDigits >= 0 ? (rawTicks as any).fractionDigits : 0;

        const halfBandwidth = (this.scale.bandwidth ?? 0) / 2;
        const ticks: TickDatum[] = [];

        let labelCount = 0;
        const tickIds = new Set<string>();
        for (let i = 0; i < rawTicks.length; i++) {
            const rawTick = rawTicks[i];
            const translationY = scale.convert(rawTick) + halfBandwidth;

            const tickLabel = this.formatTick(rawTick, i);

            // Create a tick id from the label, or as an increment of the last label if this tick label is blank
            let tickId = tickLabel;
            let j = 0;
            while (tickIds.has(tickId)) {
                tickId = `${tickLabel}_${++j}`;
            }
            tickIds.add(tickId);

            ticks.push({ tick: rawTick, tickId, tickLabel, translationY });

            if (tickLabel === '' || tickLabel == undefined) {
                continue;
            }
            labelCount++;
        }

        return { rawTicks, ticks, labelCount };
    }

    private filterTicks(ticks: any, tickCount: number): any[] {
        const tickSpacing = !isNaN(this.tick.minSpacing) || !isNaN(this.tick.maxSpacing ?? NaN);
        const keepEvery = tickSpacing ? Math.ceil(ticks.length / tickCount) : 2;
        return ticks.filter((_: any, i: number) => i % keepEvery === 0);
    }

    private createTicks(tickCount: number, minTickCount: number, maxTickCount: number) {
        this.setTickCount(tickCount, minTickCount, maxTickCount);
        return this.scale.ticks?.() ?? [];
    }

    private estimateTickCount({ minSpacing, maxSpacing }: { minSpacing: number; maxSpacing: number }): {
        minTickCount: number;
        maxTickCount: number;
        defaultTickCount: number;
    } {
        const availableRange = this.calculateAvailableRange();

        const defaultMinSpacing = Math.max(
            Axis.defaultTickMinSpacing,
            availableRange / ContinuousScale.defaultMaxTickCount
        );

        if (isNaN(minSpacing) && isNaN(maxSpacing)) {
            minSpacing = defaultMinSpacing;
            maxSpacing = availableRange;

            if (minSpacing > maxSpacing) {
                // Take automatic minSpacing if there is a conflict.
                maxSpacing = minSpacing;
            }
        } else if (isNaN(minSpacing)) {
            minSpacing = defaultMinSpacing;

            if (minSpacing > maxSpacing) {
                // Take user-suplied maxSpacing if there is a conflict.
                minSpacing = maxSpacing;
            }
        } else if (isNaN(maxSpacing)) {
            maxSpacing = availableRange;

            if (minSpacing > maxSpacing) {
                // Take user-suplied minSpacing if there is a conflict.
                maxSpacing = minSpacing;
            }
        }

        const maxTickCount = Math.max(1, Math.floor(availableRange / minSpacing));
        const minTickCount = Math.min(maxTickCount, Math.ceil(availableRange / maxSpacing));

        let defaultTickCount = ContinuousScale.defaultTickCount;
        if (defaultTickCount > maxTickCount) {
            defaultTickCount = maxTickCount;
        } else if (defaultTickCount < minTickCount) {
            defaultTickCount = minTickCount;
        }

        return { minTickCount, maxTickCount, defaultTickCount };
    }

    private updateVisibility() {
        const { range: requestedRange } = this;

        const requestedRangeMin = Math.min(...requestedRange);
        const requestedRangeMax = Math.max(...requestedRange);

        const visibleFn = (node: Line | Text | Arc) => {
            const min = Math.floor(requestedRangeMin);
            const max = Math.ceil(requestedRangeMax);
            if (min === max) {
                node.visible = false;
                return;
            }

            // Fix an effect of rounding error
            if (node.translationY >= min - 1 && node.translationY < min) {
                node.translationY = min;
            }
            if (node.translationY > max && node.translationY <= max + 1) {
                node.translationY = max;
            }

            const visible = node.translationY >= min && node.translationY <= max;
            node.visible = visible;
        };

        const { gridLineGroupSelection, tickLineGroupSelection, tickLabelGroupSelection } = this;
        gridLineGroupSelection.each(visibleFn);
        tickLineGroupSelection.each(visibleFn);
        tickLabelGroupSelection.each(visibleFn);

        this.tickLineGroup.visible = this.tick.enabled;
        this.tickLabelGroup.visible = this.label.enabled;
    }

    protected updateCrossLines({
        rotation,
        parallelFlipRotation,
        regularFlipRotation,
        sideFlag,
    }: {
        rotation: number;
        parallelFlipRotation: number;
        regularFlipRotation: number;
        sideFlag: Flag;
    }) {
        const anySeriesActive = this.isAnySeriesActive();
        this.crossLines?.forEach((crossLine) => {
            crossLine.sideFlag = -sideFlag as Flag;
            crossLine.direction = rotation === -Math.PI / 2 ? ChartAxisDirection.X : ChartAxisDirection.Y;
            crossLine.label.parallel = crossLine.label.parallel ?? this.label.parallel;
            crossLine.parallelFlipRotation = parallelFlipRotation;
            crossLine.regularFlipRotation = regularFlipRotation;
            crossLine.update(anySeriesActive);
        });
    }

    protected updateTickLines(sideFlag: Flag) {
        const { tick } = this;
        this.tickLineGroupSelection.each((line) => {
            line.strokeWidth = tick.width;
            line.stroke = tick.color;
            line.x1 = sideFlag * tick.size;
            line.x2 = 0;
            line.y1 = 0;
            line.y2 = 0;
        });
    }

    private calculateAvailableRange(): number {
        const { range: requestedRange } = this;

        const min = Math.min(...requestedRange);
        const max = Math.max(...requestedRange);

        return max - min;
    }

    protected calculateDomain() {
        const { direction, boundSeries, includeInvisibleDomains } = this;

        if (this.linkedTo) {
            this.dataDomain = this.linkedTo.dataDomain;
        } else {
            const domains: any[][] = [];
            const visibleSeries = boundSeries.filter((s) => includeInvisibleDomains || s.isEnabled());
            for (const series of visibleSeries) {
                domains.push(series.getDomain(direction));
            }

            const domain = new Array<any>().concat(...domains);
            this.dataDomain = this.normaliseDataDomain(domain);
        }
    }

    updatePosition({ rotation, sideFlag }: { rotation: number; sideFlag: Flag }) {
        const { crossLineGroup, axisGroup, gridGroup, translation, gridLineGroupSelection, gridPadding, gridLength } =
            this;
        const translationX = Math.floor(translation.x);
        const translationY = Math.floor(translation.y);

        crossLineGroup.translationX = translationX;
        crossLineGroup.translationY = translationY;
        crossLineGroup.rotation = rotation;

        axisGroup.translationX = translationX;
        axisGroup.translationY = translationY;
        axisGroup.rotation = rotation;

        gridGroup.translationX = translationX;
        gridGroup.translationY = translationY;
        gridGroup.rotation = rotation;

        gridLineGroupSelection.each((line) => {
            line.x1 = gridPadding;
            line.x2 = -sideFlag * gridLength + gridPadding;
            line.y1 = 0;
            line.y2 = 0;
        });
    }

    updateSecondaryAxisTicks(_primaryTickCount: number | undefined): any[] {
        throw new Error('AG Charts - unexpected call to updateSecondaryAxisTicks() - check axes configuration.');
    }

    private updateSelections(data: TickDatum[]) {
        const gridData = this.gridLength ? data : [];
        const gridLineGroupSelection = this.gridLineGroupSelection.update(
            gridData,
            (group) => {
                const node = new Line();
                node.tag = Tags.GridLine;
                group.append(node);
            },
            (datum: TickDatum) => datum.tickId
        );
        const tickLineGroupSelection = this.tickLineGroupSelection.update(
            data,
            (group) => {
                const line = new Line();
                line.tag = Tags.TickLine;
                group.appendChild(line);
            },
            (datum: TickDatum) => datum.tickId
        );
        const tickLabelGroupSelection = this.tickLabelGroupSelection.update(
            data,
            (group) => {
                const text = new Text();
                text.tag = Tags.TickLabel;
                group.appendChild(text);
            },
            (datum: TickDatum) => datum.tickId
        );

        this.tickLineGroupSelection = tickLineGroupSelection;
        this.tickLabelGroupSelection = tickLabelGroupSelection;
        this.gridLineGroupSelection = gridLineGroupSelection;
    }

    protected updateGridLines(sideFlag: Flag) {
        const { gridStyle, tick, gridPadding, gridLength } = this;
        if (gridLength === 0 || gridStyle.length === 0) {
            return;
        }
        const styleCount = gridStyle.length;
        this.gridLineGroupSelection.each((line, _, index) => {
            const style = gridStyle[index % styleCount];

            line.x1 = gridPadding;
            line.x2 = -sideFlag * gridLength + gridPadding;
            line.y1 = 0;
            line.y2 = 0;

            line.stroke = style.stroke;
            line.strokeWidth = tick.width;
            line.lineDash = style.lineDash;
            line.fill = undefined;
        });
    }

    protected updateLabels({
        tickLabelGroupSelection,
        combinedRotation,
        textBaseline,
        textAlign,
        labelX,
    }: {
        tickLabelGroupSelection: Selection<Text, any>;
        combinedRotation: number;
        textBaseline: CanvasTextBaseline;
        textAlign: CanvasTextAlign;
        labelX: number;
    }) {
        const {
            label,
            label: { enabled: labelsEnabled },
        } = this;

        if (!labelsEnabled) {
            return;
        }

        // Apply label option values
        tickLabelGroupSelection.each((node, datum) => {
            const { tickLabel } = datum;
            node.fontStyle = label.fontStyle;
            node.fontWeight = label.fontWeight;
            node.fontSize = label.fontSize;
            node.fontFamily = label.fontFamily;
            node.fill = label.color;
            node.text = tickLabel;
            const userHidden = node.text === '' || node.text == undefined;

            if (userHidden) {
                node.visible = false; // hide empty labels
                return;
            }

            // Position labels
            node.textBaseline = textBaseline;
            node.textAlign = textAlign;
            node.x = labelX;
            node.rotationCenterX = labelX;
            node.rotation = combinedRotation;
            node.visible = true;
        });
    }

    private wrapLabels(tickData: TickData, index: number, labelProps: TextSizeProperties): TickStrategyResult {
        const {
            label: { parallel, maxWidth, maxHeight },
        } = this;

        const defaultMaxLabelWidth = parallel
            ? Math.round(this.calculateAvailableRange() / tickData.labelCount)
            : this.maxThickness;
        const maxLabelWidth = maxWidth ?? defaultMaxLabelWidth;

        const defaultMaxLabelHeight = parallel
            ? this.maxThickness
            : Math.round(this.calculateAvailableRange() / tickData.labelCount);
        const maxLabelHeight = maxHeight ?? defaultMaxLabelHeight;

        tickData.ticks.forEach((tickDatum) => {
            const { tickLabel } = tickDatum;
            const wrapping: TextWrap = 'hyphenate';
            const wrappedTickLabel = Text.wrap(tickLabel, maxLabelWidth, maxLabelHeight, labelProps, wrapping);
            tickDatum.tickLabel = wrappedTickLabel;
        });

        return { tickData, index, autoRotation: 0, terminate: true };
    }

    private updateLine() {
        // Render axis line.
        const { lineNode, range: requestedRange } = this;

        lineNode.x1 = 0;
        lineNode.x2 = 0;
        lineNode.y1 = requestedRange[0];
        lineNode.y2 = requestedRange[1];
        lineNode.strokeWidth = this.line.width;
        lineNode.stroke = this.line.color;
        lineNode.visible = true;
    }

    protected updateTitle({ anyTickVisible, sideFlag }: { anyTickVisible: boolean; sideFlag: Flag }): void {
        const identityFormatter = (params: AgAxisCaptionFormatterParams) => params.defaultValue;
        const {
            rotation,
            title,
            _titleCaption,
            lineNode,
            range: requestedRange,
            tickLineGroup,
            tickLabelGroup,
            moduleCtx: { callbackCache },
        } = this;
        const { formatter = identityFormatter } = this.title ?? {};

        if (!title) {
            _titleCaption.enabled = false;
            return;
        }

        _titleCaption.enabled = title.enabled;
        _titleCaption.fontFamily = title.fontFamily;
        _titleCaption.fontSize = title.fontSize;
        _titleCaption.fontStyle = title.fontStyle;
        _titleCaption.fontWeight = title.fontWeight;
        _titleCaption.color = title.color;
        _titleCaption.wrapping = title.wrapping;

        let titleVisible = false;
        const titleNode = _titleCaption.node;
        if (title.enabled && lineNode.visible) {
            titleVisible = true;

            const parallelFlipRotation = normalizeAngle360(rotation);
            const padding = Caption.PADDING;
            const titleRotationFlag =
                sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;

            titleNode.rotation = (titleRotationFlag * sideFlag * Math.PI) / 2;
            titleNode.x = Math.floor((titleRotationFlag * sideFlag * (requestedRange[0] + requestedRange[1])) / 2);

            let bboxYDimension = 0;

            if (anyTickVisible) {
                const tickBBox = Group.computeBBox([tickLineGroup, tickLabelGroup]);
                const tickWidth = rotation === 0 ? tickBBox.width : tickBBox.height;
                if (Math.abs(tickWidth) < Infinity) {
                    bboxYDimension += tickWidth;
                }
            }

            if (sideFlag === -1) {
                titleNode.y = Math.floor(titleRotationFlag * (-padding - bboxYDimension));
            } else {
                titleNode.y = Math.floor(-padding - bboxYDimension);
            }
            titleNode.textBaseline = titleRotationFlag === 1 ? 'bottom' : 'top';

            titleNode.text = callbackCache.call(formatter, this.getTitleFormatterParams());
        }

        titleNode.visible = titleVisible;
    }

    // For formatting (nice rounded) tick values.
    formatTick(datum: any, index: number): string {
        const {
            label,
            labelFormatter,
            fractionDigits,
            moduleCtx: { callbackCache },
        } = this;

        if (label.formatter) {
            const defaultValue = fractionDigits > 0 ? datum : String(datum);
            return (
                callbackCache.call(label.formatter, {
                    value: defaultValue,
                    index,
                    fractionDigits,
                    formatter: labelFormatter,
                }) ?? defaultValue
            );
        } else if (labelFormatter) {
            return callbackCache.call(labelFormatter, datum) ?? String(datum);
        }
        // The axis is using a logScale or the`datum` is an integer, a string or an object
        return String(datum);
    }

    // For formatting arbitrary values between the ticks.
    formatDatum(datum: any): string {
        return String(datum);
    }

    maxThickness: number = Infinity;

    computeBBox(): BBox {
        return this.axisGroup.computeBBox();
    }

    initCrossLine(crossLine: CrossLine) {
        crossLine.scale = this.scale;
        crossLine.gridLength = this.gridLength;
    }

    isAnySeriesActive() {
        return this.boundSeries.some((s) => this.includeInvisibleDomains || s.isEnabled());
    }

    clipTickLines(x: number, y: number, width: number, height: number) {
        this.tickLineGroup.setClipRectInGroupCoordinateSpace(new BBox(x, y, width, height));
    }

    clipGrid(x: number, y: number, width: number, height: number) {
        this.gridGroup.setClipRectInGroupCoordinateSpace(new BBox(x, y, width, height));
    }

    calculatePadding(min: number, _max: number): [number, number] {
        return [Math.abs(min * 0.01), Math.abs(min * 0.01)];
    }

    protected getTitleFormatterParams() {
        const boundSeries = this.boundSeries.reduce((acc, next) => {
            const keys = next.getKeys(this.direction);
            const names = next.getNames(this.direction);
            for (let idx = 0; idx < keys.length; idx++) {
                acc.push({
                    key: keys[idx],
                    name: names[idx],
                });
            }
            return acc;
        }, [] as AgAxisCaptionFormatterParams['boundSeries']);
        return {
            direction: this.direction,
            boundSeries,
            defaultValue: this.title?.text,
        };
    }

    normaliseDataDomain(d: D[]): D[] {
        return d;
    }

    getLayoutState(): AxisLayout {
        return {
            rect: this.computeBBox(),
            gridPadding: this.gridPadding,
            seriesAreaPadding: this.seriesAreaPadding,
            tickSize: this.tick.size,
            ...this.layout,
        };
    }

    protected createAxisContext(): AxisContext {
        const keys = () => {
            return this.boundSeries
                .map((s) => s.getKeys(this.direction))
                .reduce((keys, seriesKeys) => {
                    keys.push(...seriesKeys);
                    return keys;
                }, []);
        };
        return {
            axisId: this.id,
            direction: this.direction,
            continuous: this.scale instanceof ContinuousScale,
            keys,
            scaleValueFormatter: (specifier: string) => this.scale.tickFormat?.({ specifier }) ?? undefined,
            scaleBandwidth: () => this.scale.bandwidth ?? 0,
            scaleConvert: (val) => this.scale.convert(val),
            scaleInvert: (val) => this.scale.invert?.(val) ?? undefined,
        };
    }

    addModule(module: AxisOptionModule) {
        if (this.modules[module.optionsKey] != null) {
            throw new Error('AG Charts - module already initialised: ' + module.optionsKey);
        }

        if (this.axisContext == null) {
            this.axisContext = this.createAxisContext();
        }

        const moduleInstance = new module.instanceConstructor({
            ...this.moduleCtx,
            parent: this.axisContext,
        });
        this.modules[module.optionsKey] = { instance: moduleInstance };

        (this as any)[module.optionsKey] = moduleInstance;
    }

    removeModule(module: AxisOptionModule) {
        this.modules[module.optionsKey]?.instance?.destroy();
        delete this.modules[module.optionsKey];
        delete (this as any)[module.optionsKey];
    }

    isModuleEnabled(module: AxisOptionModule) {
        return this.modules[module.optionsKey] != null;
    }

    animateReadyUpdate(diff: AxisUpdateDiff) {
        if (!diff.changed) {
            this.resetSelectionNodes();
            return;
        }

        const { gridLineGroupSelection, tickLineGroupSelection, tickLabelGroupSelection } = this;

        const addedCount = Object.keys(diff.added).length;
        const removedCount = Object.keys(diff.removed).length;

        if (removedCount === diff.tickCount) {
            this.resetSelectionNodes();
            return;
        }

        const totalDuration = this.animationManager?.defaultOptions.duration ?? 1000;
        let sectionDuration = Math.floor(totalDuration / 2);
        if (addedCount > 0 && removedCount > 0) {
            sectionDuration = Math.floor(totalDuration / 3);
        }
        const options = {
            delay: removedCount > 0 ? sectionDuration : 0,
            duration: sectionDuration,
        };

        const animationGroup = `${this.id}_${Math.random()}`;

        tickLabelGroupSelection.each((node, datum) => {
            this.animateSelectionNode(tickLabelGroupSelection, diff, options, node, datum, animationGroup);
        });

        gridLineGroupSelection.each((node, datum) => {
            this.animateSelectionNode(gridLineGroupSelection, diff, options, node, datum, animationGroup);
        });

        tickLineGroupSelection.each((node, datum) => {
            this.animateSelectionNode(tickLineGroupSelection, diff, options, node, datum, animationGroup);
        });
    }

    private animateSelectionNode(
        selection: Selection<Text | Line, any>,
        diff: AxisUpdateDiff,
        options: { delay: number; duration: number },
        node: Text | Line,
        datum: TickDatum,
        animationGroup: string
    ) {
        const roundedTranslationY = Math.round(datum.translationY);
        let translate = { from: node.translationY, to: roundedTranslationY };
        let opacity = { from: 1, to: 1 };

        const { duration } = options;
        let { delay } = options;

        const datumId = datum.tickLabel;
        if (diff.added[datumId]) {
            translate = { from: roundedTranslationY, to: roundedTranslationY };
            opacity = { from: 0, to: 1 };
            delay += duration;
        } else if (diff.removed[datumId]) {
            opacity = { from: 1, to: 0 };
            delay = 0;
        }

        const props = [translate, opacity];

        this.animationManager.animateManyWithThrottle(`${this.id}_ready-update_${node.id}`, props, {
            disableInteractions: false,
            delay,
            duration,
            ease: easing.easeOut,
            throttleId: this.id,
            throttleGroup: animationGroup,
            onUpdate([translationY, opacity]) {
                node.translationY = translationY;
                node.opacity = opacity;
            },
            onComplete() {
                selection.cleanup();
            },
        });
    }

    private resetSelectionNodes() {
        const { gridLineGroupSelection, tickLineGroupSelection, tickLabelGroupSelection } = this;

        gridLineGroupSelection.cleanup();
        tickLineGroupSelection.cleanup();
        tickLabelGroupSelection.cleanup();

        // We need raw `translationY` values on `datum` for accurate label collision detection in axes.update()
        // But node `translationY` values must be rounded to get pixel grid alignment
        const resetFn = (node: Line | Text) => {
            node.translationY = Math.round(node.datum.translationY);
            node.opacity = 1;
        };
        gridLineGroupSelection.each(resetFn);
        tickLineGroupSelection.each(resetFn);
        tickLabelGroupSelection.each(resetFn);
    }

    private calculateUpdateDiff(previous: string[], tickData: TickData): AxisUpdateDiff {
        const added = new Set<string>();
        const removed = new Set<string>();

        const tickCount = Math.max(previous.length, tickData.ticks.length);

        for (let i = 0; i < tickCount; i++) {
            const prev = previous[i];
            const tick = tickData.ticks[i]?.tickId;

            if (prev === tick) {
                continue;
            }

            if (removed.has(tick)) {
                removed.delete(tick);
            } else if (tick) {
                added.add(tick);
            }

            if (added.has(prev)) {
                added.delete(prev);
            } else if (prev) {
                removed.add(prev);
            }
        }

        const addedKeys: { [key: string]: true } = {};
        const removedKeys: { [key: string]: true } = {};
        added.forEach((a) => {
            addedKeys[a] = true;
        });
        removed.forEach((r) => {
            removedKeys[r] = true;
        });

        return {
            changed: added.size > 0 || removed.size > 0,
            tickCount,
            added: addedKeys,
            removed: removedKeys,
        };
    }
}

import type { AxisContext, ModuleContextWithParent } from '../module/moduleContext';
import type { ModuleMap } from '../module/moduleMap';
import type { AgAxisLabelFormatterParams, AgCartesianAxisPosition, FontOptions } from '../options/agChartOptions';
import type { Scale } from '../scale/scale';
import type { BBox } from '../scene/bbox';
import type { Node } from '../scene/node';
import type { AxisGridLine } from './axis/axisGridLine';
import type { AxisLine } from './axis/axisLine';
import type { AxisTick } from './axis/axisTick';
import type { ChartAnimationPhase } from './chartAnimationPhase';
import type { ChartAxisDirection } from './chartAxisDirection';
import type { AxisLayout } from './layout/layoutService';
import type { ISeries } from './series/seriesTypes';
export type ChartAxisLabelFlipFlag = 1 | -1;
export interface ChartAxis {
    attachAxis(axisGroup: Node, gridGroup: Node): void;
    boundSeries: ISeries<unknown>[];
    calculateLayout(primaryTickCount?: number): {
        primaryTickCount: number | undefined;
        bbox: BBox;
    };
    calculatePadding(min: number, _max: number, reverse: boolean): [number, number];
    clipGrid(x: number, y: number, width: number, height: number): void;
    clipTickLines(x: number, y: number, width: number, height: number): void;
    computeBBox(): BBox;
    isReversed(): boolean;
    crossLines?: any[];
    dataDomain: {
        domain: any[];
        clipped: boolean;
    };
    destroy(): void;
    detachAxis(axisGroup: Node, gridGroup: Node): void;
    direction: ChartAxisDirection;
    interactionEnabled: boolean;
    formatDatum(datum: any): string;
    getLayoutState(): AxisLayout;
    getModuleMap(): ModuleMap<any, any, any>;
    gridLength: number;
    gridPadding: number;
    id: string;
    inRange(x: number, width?: number, tolerance?: number): boolean;
    keys: string[];
    line: AxisLine;
    gridLine: AxisGridLine;
    label: ChartAxisLabel;
    tick: AxisTick<any>;
    maxThickness: number;
    nice: boolean;
    position?: AgCartesianAxisPosition;
    range: number[];
    rotation: number;
    scale: Scale<any, any, any>;
    seriesAreaPadding: number;
    setCrossLinesVisible(visible: boolean): void;
    thickness?: number;
    translation: {
        x: number;
        y: number;
    };
    type: string;
    update(primaryTickCount?: number, animated?: boolean): number | undefined;
    updateScale(): void;
    updatePosition(position: {
        rotation: number;
        sideFlag: ChartAxisLabelFlipFlag;
    }): void;
    visibleRange: number[];
    createModuleContext: () => ModuleContextWithParent<AxisContext>;
    resetAnimation(chartAnimationPhase: ChartAnimationPhase): unknown;
}
export interface ChartAxisLabel extends FontOptions {
    autoRotate?: boolean;
    autoRotateAngle?: number;
    autoWrap?: boolean;
    avoidCollisions: boolean;
    enabled: boolean;
    format?: string;
    formatter?: (params: AgAxisLabelFormatterParams) => string;
    getFont(): string;
    getSideFlag(): ChartAxisLabelFlipFlag;
    maxHeight?: number;
    maxWidth?: number;
    minSpacing: number;
    mirrored: boolean;
    padding: number;
    parallel: boolean;
    rotation?: number;
}

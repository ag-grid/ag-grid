import type { Node } from '../scene/node';
import type { BBox } from '../scene/bbox';
import type { AgCartesianAxisPosition } from './agChartOptions';
import type { Flag } from './label';
import type { AxisLayout } from './layout/layoutService';
import type { ChartAxisDirection } from './chartAxisDirection';
import type { Scale } from '../scale/scale';
export interface BoundSeries {
    getBandScalePadding?(): {
        inner: number;
        outer: number;
    };
    getDomain(direction: ChartAxisDirection): any[];
    getKeys(direction: ChartAxisDirection): string[];
    getNames(direction: ChartAxisDirection): (string | undefined)[];
    isEnabled(): boolean;
    type: string;
    visible: boolean;
}
export interface ChartAxis {
    addModule(module: any): void;
    attachAxis(node: Node): void;
    boundSeries: BoundSeries[];
    calculatePadding(min: number, _max: number): [number, number];
    clipGrid(x: number, y: number, width: number, height: number): void;
    clipTickLines(x: number, y: number, width: number, height: number): void;
    computeBBox(): BBox;
    crossLines?: any[];
    dataDomain: any[];
    destroy(): void;
    detachAxis(node: Node): void;
    direction: ChartAxisDirection;
    formatDatum(datum: any): string;
    getLayoutState(): AxisLayout;
    gridLength: number;
    gridPadding: number;
    id: string;
    inRange(x: number, width?: number, tolerance?: number): boolean;
    inRangeEx(x: number, width?: number, tolerance?: number): -1 | 0 | 1;
    isModuleEnabled(module: any): boolean;
    keys: string[];
    label: {
        getSideFlag(): Flag;
    };
    linkedTo?: ChartAxis;
    maxThickness: number;
    nice: boolean;
    position?: AgCartesianAxisPosition;
    range: number[];
    removeModule(module: any): void;
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
    update(primaryTickCount?: number): number | undefined;
    updateScale(): void;
    updatePosition(position: {
        rotation: number;
        sideFlag: Flag;
    }): void;
    visibleRange: number[];
}
//# sourceMappingURL=chartAxis.d.ts.map
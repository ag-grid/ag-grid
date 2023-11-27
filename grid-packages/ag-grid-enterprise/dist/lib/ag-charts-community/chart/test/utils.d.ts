/// <reference types="node" />
import type { PngConfig } from 'canvas';
import { Canvas } from 'canvas';
import type { MatchImageSnapshotOptions } from 'jest-image-snapshot';
import type { AgCartesianChartOptions, AgChartInstance, AgChartOptions, AgPolarChartOptions } from '../../options/agChartOptions';
import type { Chart } from '../chart';
import type { AgChartProxy } from '../chartProxy';
export interface TestCase {
    options: AgChartOptions;
    assertions: (chart: Chart | AgChartProxy) => Promise<void>;
    extraScreenshotActions?: (chart: AgChartInstance) => Promise<void>;
}
export interface CartesianTestCase extends TestCase {
    options: AgCartesianChartOptions;
}
export interface PolarTestCase extends TestCase {
    options: AgPolarChartOptions;
}
export declare const IMAGE_SNAPSHOT_DEFAULTS: MatchImageSnapshotOptions;
export declare const CANVAS_TO_BUFFER_DEFAULTS: PngConfig;
export declare function prepareTestOptions<T extends AgChartOptions>(options: T, container?: HTMLElement): T;
export declare function deproxy(chartOrProxy: AgChartProxy | Chart): Chart;
export declare function repeat<T>(value: T, count: number): T[];
export declare function range(start: number, end: number, step?: number): number[];
export declare function dateRange(start: Date, end: Date, step?: number): Date[];
export declare function waitForChartStability(chartOrProxy: Chart | AgChartProxy, animationAdvanceMs?: number): Promise<void>;
export declare function mouseMoveEvent({ offsetX, offsetY }: {
    offsetX: number;
    offsetY: number;
}): MouseEvent;
export declare function clickEvent({ offsetX, offsetY }: {
    offsetX: number;
    offsetY: number;
}): MouseEvent;
export declare function doubleClickEvent({ offsetX, offsetY }: {
    offsetX: number;
    offsetY: number;
}): MouseEvent;
export declare function wheelEvent({ clientX, clientY, deltaY, }: {
    clientX: number;
    clientY: number;
    deltaY: number;
}): WheelEvent;
export declare function cartesianChartAssertions(params?: {
    type?: string;
    axisTypes?: string[];
    seriesTypes?: string[];
}): (chartOrProxy: Chart | AgChartProxy) => Promise<void>;
export declare function polarChartAssertions(params?: {
    seriesTypes?: string[];
}): (chartOrProxy: Chart | AgChartProxy) => Promise<void>;
export declare function hierarchyChartAssertions(params?: {
    seriesTypes?: string[];
}): (chartOrProxy: Chart | AgChartProxy) => Promise<void>;
export declare function hoverAction(x: number, y: number): (chart: Chart | AgChartProxy) => Promise<void>;
export declare function clickAction(x: number, y: number): (chart: Chart | AgChartProxy) => Promise<void>;
export declare function doubleClickAction(x: number, y: number): (chart: Chart | AgChartProxy) => Promise<void>;
export declare function scrollAction(x: number, y: number, delta: number): (chart: Chart | AgChartProxy) => Promise<void>;
export declare function extractImageData({ nodeCanvas, bbox, }: {
    nodeCanvas: Canvas;
    bbox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}): Buffer;
export declare function setupMockCanvas(): {
    nodeCanvas: Canvas;
};
export declare function toMatchImage(this: any, actual: Buffer, expected: Buffer, { writeDiff }?: {
    writeDiff?: boolean | undefined;
}): {
    message: () => string;
    pass: boolean;
};
export declare function createChart(options: AgChartOptions): Promise<Chart>;
export declare function spyOnAnimationManager(): (totalDuration: number, ratio: number) => void;

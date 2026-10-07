import type { AgColorType } from 'ag-charts-types';

import type { ChartTranslationKey } from '../../../../services/chartTranslationService';

/** A colour taken from the palette at render time. */
export interface MiniChartSvgSlot {
    palette: 'fills' | 'strokes';
    index: number;
}

/** A palette slot, or a literal colour that does not depend on the palette (e.g. the axis `gray`). */
export type MiniChartSvgPaint = MiniChartSvgSlot | string;

export interface MiniChartSvgShape {
    tag: 'path' | 'line';
    /** Geometry and non-colour presentation attributes, written as-is. */
    attrs: Record<string, string | number>;
    /** Omitted means `fill="none"`. */
    fill?: MiniChartSvgPaint;
    /** Omitted means no stroke. */
    stroke?: MiniChartSvgPaint;
}

export interface MiniChartSvgGroup {
    tag: 'g';
    /** `[x, y, width, height]` in thumbnail coordinates. */
    clip?: [number, number, number, number];
    opacity?: number;
    transform?: string;
    children: MiniChartSvgNode[];
}

export type MiniChartSvgNode = MiniChartSvgShape | MiniChartSvgGroup;

export interface MiniChartSvgTemplate {
    tooltip: ChartTranslationKey;
    children: MiniChartSvgNode[];
}

/** Resolves a slot to a palette colour, so a type can derive colours rather than index the palette directly. */
export type MiniChartSvgColorFn = (
    slot: MiniChartSvgSlot,
    fills: AgColorType[],
    strokes: string[],
    isCustomTheme: boolean
) => AgColorType | undefined;

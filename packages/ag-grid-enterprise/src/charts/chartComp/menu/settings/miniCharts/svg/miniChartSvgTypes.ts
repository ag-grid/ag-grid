import type { ChartTranslationKey } from '../../../../services/chartTranslationService';

/** A colour taken from the solid fills or strokes palette at render time. */
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
    /** `[x, y, width, height]` in thumbnail coordinates; children outside it are hidden. */
    clip?: [number, number, number, number];
    transform?: string;
    children: MiniChartSvgNode[];
}

export type MiniChartSvgNode = MiniChartSvgShape | MiniChartSvgGroup;

export interface MiniChartSvgTemplate {
    tooltip: ChartTranslationKey;
    /** Drawn in document order, so later nodes are painted over earlier ones. */
    children: MiniChartSvgNode[];
}

import { _ModuleSupport, _Scene } from 'ag-charts-community';

interface DefinedZoomState extends _ModuleSupport.AxisZoomState {
    x: { min: number; max: number };
    y: { min: number; max: number };
}

const unitZoomState: () => DefinedZoomState = () => ({
    x: { min: 0, max: 1 },
    y: { min: 0, max: 1 },
});

const constrain = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export function definedZoomState(zoom?: _ModuleSupport.AxisZoomState): DefinedZoomState {
    return {
        x: { min: zoom?.x?.min ?? 0, max: zoom?.x?.max ?? 1 },
        y: { min: zoom?.y?.min ?? 0, max: zoom?.y?.max ?? 1 },
    };
}

/**
 * Calculate the position on the series rect as a ratio from the top left corner. Invert the ratio on the y-axis to
 * cater for conflicting direction between screen and chart axis systems. Constrains the point to the series
 * rect so the zoom is pinned to the edges if the point is over the legends, axes, etc.
 */
export function pointToRatio(bbox: _Scene.BBox, x: number, y: number): { x: number; y: number } {
    if (!bbox) return { x: 0, y: 0 };

    const constrainedX = constrain(x - bbox.x, 0, bbox.x + bbox.width);
    const constrainedY = constrain(y - bbox.y, 0, bbox.y + bbox.height);

    const rx = (1 / bbox.width) * constrainedX;
    const ry = 1 - (1 / bbox.height) * constrainedY;

    return { x: constrain(rx), y: constrain(ry) };
}

/**
 * Translate a zoom bounding box by shifting all points by the given x & y amounts.
 */
export function translateZoom(zoom: DefinedZoomState, x: number, y: number): DefinedZoomState {
    return {
        x: { min: zoom.x.min + x, max: zoom.x.max + x },
        y: { min: zoom.y.min + y, max: zoom.y.max + y },
    };
}

/**
 * Scale a zoom bounding box from the top left corner.
 */
export function scaleZoom(zoom: DefinedZoomState, sx: number, sy: number): DefinedZoomState {
    const dx = zoom.x.max - zoom.x.min;
    const dy = zoom.y.max - zoom.y.min;

    return {
        x: { min: zoom.x.min, max: zoom.x.min + dx * sx },
        y: { min: zoom.y.min, max: zoom.y.min + dy * sy },
    };
}

export function scaleZoomCenter(zoom: DefinedZoomState, sx: number, sy: number): DefinedZoomState {
    const dx = zoom.x.max - zoom.x.min;
    const dy = zoom.y.max - zoom.y.min;

    const cx = zoom.x.min + dx / 2;
    const cy = zoom.y.min + dy / 2;

    return {
        x: { min: cx - (dx * sx) / 2, max: cx + (dx * sx) / 2 },
        y: { min: cy - (dy * sy) / 2, max: cy + (dy * sy) / 2 },
    };
}

/**
 * Constrain a zoom bounding box such that no corner exceeds an edge while maintaining the same width and height.
 */
export function constrainZoom(zoom: DefinedZoomState): DefinedZoomState {
    const after = unitZoomState();

    const dx = zoom.x.max - zoom.x.min;

    const xMin = zoom.x.min;
    const xMax = zoom.x.max;

    after.x.min = xMax > 1 ? 1 - dx : xMin;
    after.x.max = xMin < 0 ? dx : xMax;

    after.x.min = Math.max(0, after.x.min);
    after.x.max = Math.min(1, after.x.max);

    const dy = zoom.y.max - zoom.y.min;

    const yMin = zoom.y.min;
    const yMax = zoom.y.max;

    after.y.min = yMax > 1 ? 1 - dy : yMin;
    after.y.max = yMin < 0 ? dy : yMax;

    after.y.min = Math.max(0, after.y.min);
    after.y.max = Math.min(1, after.y.max);

    return after;
}

import { _hasOwn } from '../utils/generic';
import type { Alignment } from './popupPositionUtils';
import { findBestPlacement, getEffectivePlacements } from './popupPositionUtils';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export type TooltipPosition = TooltipSide | `${TooltipSide}-${'start' | 'end'}`;

const ALIGNMENTS: Record<TooltipPosition, Alignment> = {
    top: 'bc-tc',
    'top-start': 'bl-tl',
    'top-end': 'br-tr',
    bottom: 'tc-bc',
    'bottom-start': 'tl-bl',
    'bottom-end': 'tr-br',
    left: 'r-l',
    'left-start': 'tr-tl',
    'left-end': 'br-bl',
    right: 'l-r',
    'right-start': 'tl-tr',
    'right-end': 'bl-br',
};
const OPPOSITE: Record<TooltipSide, TooltipSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const TOOLTIP_POSITIONS = Object.keys(ALIGNMENTS);

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function isTooltipPosition(value: unknown): value is TooltipPosition {
    return typeof value === 'string' && _hasOwn(ALIGNMENTS, value);
}

export function findTooltipPosition(
    reference: { top: number; left: number; right: number; bottom: number },
    size: { width: number; height: number } | ((position: TooltipPosition) => { width: number; height: number }),
    bounds: { width: number; height: number },
    options: { position: TooltipPosition; gap: number; enableRtl: boolean; arrowPadding: number }
): { x: number; y: number; position: TooltipPosition; arrowOffset: number } {
    const { position, gap, enableRtl, arrowPadding } = options;
    const [side, align] = position.split('-') as [TooltipSide, 'start' | 'end' | undefined];
    const vertical = side === 'top' || side === 'bottom';
    const opposite = (align ? `${OPPOSITE[side]}-${align}` : OPPOSITE[side]) as TooltipPosition;
    const placements = getEffectivePlacements([ALIGNMENTS[position], ALIGNMENTS[opposite]], enableRtl && vertical);
    const preferredSize = typeof size === 'function' ? size(position) : size;
    let oppositeSize = preferredSize;
    const result = findBestPlacement(
        reference,
        (alignment) => {
            if (alignment === placements[0]) {
                return preferredSize;
            }
            oppositeSize = typeof size === 'function' ? size(opposite) : size;
            return oppositeSize;
        },
        bounds,
        placements,
        { gap, fallback: 'leastOverflow' }
    );
    const preferred = result.alignment === placements[0];
    const resolvedSize = preferred ? preferredSize : oppositeSize;
    const start = vertical ? reference.left : reference.top;
    const end = vertical ? reference.right : reference.bottom;
    let point = (start + end) / 2;
    if (align) {
        const inset = Math.min(12, (end - start) / 2);
        const fromEnd = (align === 'end') !== (vertical && enableRtl);
        point = fromEnd ? end - inset : start + inset;
    }
    const length = vertical ? resolvedSize.width : resolvedSize.height;
    const padding = Math.min(arrowPadding, length / 2);
    return {
        x: result.x,
        y: result.y,
        position: preferred ? position : opposite,
        arrowOffset: Math.max(padding, Math.min(point - (vertical ? result.x : result.y), length - padding)),
    };
}

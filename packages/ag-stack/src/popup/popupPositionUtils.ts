/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type Anchor = 'tl' | 'tc' | 'tr' | 'l' | 'c' | 'r' | 'bl' | 'bc' | 'br';
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type Alignment = `${Anchor}-${Anchor}`;

interface FindBestPlacementOptions {
    gap?: number;
    enableRtl?: boolean;
    mirrorPlacementsInRtl?: boolean;
}

const MIRRORED_ANCHORS: Partial<Record<Anchor, Anchor>> = {
    tl: 'tr',
    tr: 'tl',
    l: 'r',
    r: 'l',
    bl: 'br',
    br: 'bl',
} as const;

interface Rect {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

interface Size {
    width: number;
    height: number;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function getRectSize(rect: Pick<Rect, 'top' | 'left' | 'right' | 'bottom'>): Size {
    return {
        width: rect.right - rect.left,
        height: rect.bottom - rect.top,
    };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function fitsWithinBounds(position: { x: number; y: number }, targetSize: Size, boundsSize: Size): boolean {
    return (
        position.x >= 0 &&
        position.y >= 0 &&
        position.x + targetSize.width <= boundsSize.width &&
        position.y + targetSize.height <= boundsSize.height
    );
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function toRelativeRect(
    rect: { top: number; left: number; right: number; bottom: number },
    parentRect: { top: number; left: number }
): Rect {
    return {
        top: rect.top - parentRect.top,
        left: rect.left - parentRect.left,
        right: rect.right - parentRect.left,
        bottom: rect.bottom - parentRect.top,
    };
}

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *
 * Compute the top-left position for a target element so that its anchor point
 * aligns with the reference element's anchor point.
 *
 * @param referenceRect  Bounding rect of the reference element (absolute coordinates)
 * @param targetSize     Width and height of the target element
 * @param alignment      `'{targetAnchor}-{referenceAnchor}'` e.g. `'tl-tr'`
 * @param gap            Pixel gap applied directionally away from the reference
 */
export function computeAlignedPosition(
    referenceRect: Rect,
    targetSize: Size,
    alignment: Alignment,
    gap = 0
): { x: number; y: number } {
    const [targetAnchor, refAnchor] = alignment.split('-') as [Anchor, Anchor];

    const ref = getAnchorPoint(referenceRect, refAnchor);
    const offset = getAnchorOffset(targetSize, targetAnchor);
    const gapDir = getGapDirection(targetAnchor, refAnchor);

    return {
        x: ref.x - offset.x + gapDir.dx * gap,
        y: ref.y - offset.y + gapDir.dy * gap,
    };
}

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *
 * Try a list of alignments in order, returning the position of the first one
 * that doesn't overlap the reference rect after bounds clamping.
 *
 * @param referenceRect  Bounding rect of the reference element (relative to parent)
 * @param targetSize     Width and height of the target element
 * @param parentSize     Width and height of the bounding parent
 * @param placements     Alignments to try in preference order
 * @param gap            Pixel gap applied directionally away from the reference
 * @returns              The position of the best placement, or the first placement as fallback
 */
export function findBestPlacement(
    referenceRect: Rect,
    targetSize: Size,
    parentSize: Size,
    placements: Alignment[],
    gapOrOptions: number | FindBestPlacementOptions = 0
): { x: number; y: number } {
    const { gap, enableRtl, mirrorPlacementsInRtl } = normaliseFindBestPlacementOptions(gapOrOptions);
    const effectivePlacements = getEffectivePlacements(placements, enableRtl, mirrorPlacementsInRtl);
    const { width, height } = targetSize;
    const maxX = Math.max(parentSize.width - width, 0);
    const maxY = Math.max(parentSize.height - height, 0);

    for (const alignment of effectivePlacements) {
        const pos = computeAlignedPosition(referenceRect, targetSize, alignment, gap);
        const clampedX = Math.min(Math.max(pos.x, 0), maxX);
        const clampedY = Math.min(Math.max(pos.y, 0), maxY);

        const noOverlap =
            clampedX + width <= referenceRect.left ||
            clampedX >= referenceRect.right ||
            clampedY + height <= referenceRect.top ||
            clampedY >= referenceRect.bottom;

        if (noOverlap) {
            return { x: clampedX, y: clampedY };
        }
    }

    // Fallback to first placement, clamped to parent bounds
    const fallback = computeAlignedPosition(referenceRect, targetSize, effectivePlacements[0], gap);
    return {
        x: Math.min(Math.max(fallback.x, 0), maxX),
        y: Math.min(Math.max(fallback.y, 0), maxY),
    };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function getEffectivePlacements(
    placements: Alignment[],
    enableRtl = false,
    mirrorPlacementsInRtl = true
): Alignment[] {
    if (!enableRtl || !mirrorPlacementsInRtl) {
        return placements;
    }

    return placements.map(mirrorAlignment);
}

/** Resolve an anchor to absolute coordinates on a rect. */
function getAnchorPoint(rect: Rect, anchor: Anchor): { x: number; y: number } {
    const cx = (rect.left + rect.right) / 2;
    const cy = (rect.top + rect.bottom) / 2;

    switch (anchor) {
        case 'tl':
            return { x: rect.left, y: rect.top };
        case 'tc':
            return { x: cx, y: rect.top };
        case 'tr':
            return { x: rect.right, y: rect.top };
        case 'l':
            return { x: rect.left, y: cy };
        case 'c':
            return { x: cx, y: cy };
        case 'r':
            return { x: rect.right, y: cy };
        case 'bl':
            return { x: rect.left, y: rect.bottom };
        case 'bc':
            return { x: cx, y: rect.bottom };
        case 'br':
            return { x: rect.right, y: rect.bottom };
    }
}

/** Resolve an anchor to a pixel offset within a target of the given size. */
function getAnchorOffset(size: Size, anchor: Anchor): { x: number; y: number } {
    return getAnchorPoint({ top: 0, left: 0, right: size.width, bottom: size.height }, anchor);
}

/**
 * Determine the directional sign for the gap on each axis.
 * The gap pushes the target away from the reference along the axis
 * where the two anchors differ.
 */
function getGapDirection(targetAnchor: Anchor, refAnchor: Anchor): { dx: number; dy: number } {
    const th = anchorH(targetAnchor);
    const rh = anchorH(refAnchor);
    const tv = anchorV(targetAnchor);
    const rv = anchorV(refAnchor);

    return {
        dx: Math.sign(rh - th),
        dy: Math.sign(rv - tv),
    };
}

function normaliseFindBestPlacementOptions(
    gapOrOptions: number | FindBestPlacementOptions
): Required<FindBestPlacementOptions> {
    if (typeof gapOrOptions === 'number') {
        return {
            gap: gapOrOptions,
            enableRtl: false,
            mirrorPlacementsInRtl: true,
        };
    }

    return {
        gap: gapOrOptions.gap ?? 0,
        enableRtl: gapOrOptions.enableRtl ?? false,
        mirrorPlacementsInRtl: gapOrOptions.mirrorPlacementsInRtl ?? true,
    };
}

function mirrorAlignment(alignment: Alignment): Alignment {
    const [targetAnchor, referenceAnchor] = alignment.split('-') as [Anchor, Anchor];
    return `${mirrorAnchor(targetAnchor)}-${mirrorAnchor(referenceAnchor)}`;
}

function mirrorAnchor(anchor: Anchor): Anchor {
    return MIRRORED_ANCHORS[anchor] ?? anchor;
}

/** Map anchor to horizontal position: -1 = left, 0 = centre, 1 = right */
function anchorH(anchor: Anchor): number {
    const ch = anchor.length === 2 ? anchor[1] : anchor;

    if (ch === 'l') {
        return -1;
    }

    if (ch === 'r') {
        return 1;
    }

    return 0;
}

/** Map anchor to vertical position: -1 = top, 0 = centre, 1 = bottom */
function anchorV(anchor: Anchor): number {
    if (anchor.length === 1) {
        return 0; // single-char anchors (l, c, r) are vertically centred
    }

    if (anchor.startsWith('t')) {
        return -1;
    }

    if (anchor.startsWith('b')) {
        return 1;
    }

    return 0;
}

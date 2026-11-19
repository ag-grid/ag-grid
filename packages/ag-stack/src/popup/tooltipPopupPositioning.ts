import type { IPopupService } from '../interfaces/iPopupService';
import type { Rect } from './popupPositionUtils';
import { toRelativeRect } from './popupPositionUtils';
import type { TooltipPosition } from './tooltipPositionUtils';
import { findTooltipPosition } from './tooltipPositionUtils';

export interface TooltipPopupPositionParams {
    ePopup: HTMLElement;
    pointer?: MouseEvent | Touch;
    position: TooltipPosition;
    gap: number;
    enableRtl: boolean;
    getSourceRect: () => Rect;
    postProcessCallback: (position: TooltipPosition) => void;
}

export function positionPopupForTooltip<T>(popupSvc: IPopupService<T>, params: TooltipPopupPositionParams): void {
    const { ePopup, position, gap, enableRtl } = params;
    const { reference, boundsSize, offset } = getTooltipGeometry(popupSvc.getPopupParent(), params);
    const metrics = measureTooltip(ePopup, position, boundsSize.width);
    let candidateMetrics = metrics;
    const size = ePopup.classList.contains('ag-tooltip')
        ? metrics
        : (placement: TooltipPosition) => {
              if (placement === position) {
                  return metrics;
              }
              candidateMetrics = measureTooltip(ePopup, placement, boundsSize.width);
              return candidateMetrics;
          };
    const result = findTooltipPosition(reference, size, boundsSize, {
        position,
        gap,
        enableRtl,
        arrowPadding: metrics.arrowPadding,
    });
    const positionClass = `ag-tooltip-position-${result.position}`;
    if (positionClass !== candidateMetrics.positionClass) {
        ePopup.classList.replace(candidateMetrics.positionClass, positionClass);
    }
    const resolvedMetrics = result.position === position ? metrics : candidateMetrics;
    const border =
        result.position.startsWith('top') || result.position.startsWith('bottom')
            ? resolvedMetrics.borderLeft
            : resolvedMetrics.borderTop;
    setTooltipStyle(ePopup, '--ag-tooltip-arrow-offset', `${result.arrowOffset - border}px`);

    popupSvc.positionPopup({
        ePopup,
        // The tooltip owns resize observation for its full visible lifetime.
        skipObserver: true,
        updatePosition: () => ({ x: result.x + offset.x, y: result.y + offset.y }),
        postProcessCallback: () => {
            if (!ePopup.classList.contains('ag-tooltip-hiding')) {
                params.postProcessCallback(result.position);
            }
        },
    });
}

export function getTooltipSourceRect(eventSource: HTMLElement): Rect {
    return getClippedRect(eventSource, eventSource.getBoundingClientRect());
}

export function isSourceClipped(source: HTMLElement): boolean {
    const rect = source.getBoundingClientRect();
    const win = source.ownerDocument.defaultView!;
    let parent: Element | null = source.parentElement;
    while (parent) {
        const { overflowX, overflowY } = win.getComputedStyle(parent);
        const bounds = parent.getBoundingClientRect();
        if (
            (overflowX && overflowX !== 'visible' && (rect.right <= bounds.left || rect.left >= bounds.right)) ||
            (overflowY && overflowY !== 'visible' && (rect.bottom <= bounds.top || rect.top >= bounds.bottom))
        ) {
            return true;
        }
        parent = parent.parentElement ?? (parent.getRootNode() as ShadowRoot).host ?? null;
    }
    return false;
}

function getTooltipContainingBlock(ePopup: HTMLElement): HTMLElement {
    const doc = ePopup.ownerDocument;
    const parent = ePopup.offsetParent as HTMLElement | null;
    if (parent === doc.body) {
        // offsetParent falls back to body even when the initial containing block positions the popup.
        const style = doc.defaultView!.getComputedStyle(parent);
        const transformed = [
            'transform',
            'translate',
            'rotate',
            'scale',
            'perspective',
            'filter',
            'backdrop-filter',
        ].some((property) => {
            const value = style.getPropertyValue(property);
            return !!value && value !== 'none';
        });
        if (
            style.position === 'static' &&
            !transformed &&
            !/layout|paint|strict|content/.test(style.contain) &&
            !/transform|translate|rotate|scale|perspective|filter|contain/.test(style.willChange) &&
            style.contentVisibility !== 'auto'
        ) {
            return doc.documentElement;
        }
    }
    return parent ?? doc.documentElement;
}

function getTooltipCoordinateSpace(ePopup: HTMLElement) {
    const parent = getTooltipContainingBlock(ePopup);
    const rect = parent.getBoundingClientRect();
    const scaleX = parent.offsetWidth ? rect.width / parent.offsetWidth : 1;
    const scaleY = parent.offsetHeight ? rect.height / parent.offsetHeight : 1;
    const documentScroll = parent === parent.ownerDocument.scrollingElement;
    // Document scrolling is already reflected in its bounding rect.
    const scrollX = documentScroll ? 0 : parent.scrollLeft;
    const scrollY = documentScroll ? 0 : parent.scrollTop;
    return {
        scaleX,
        scaleY,
        left: rect.left + (parent.clientLeft - scrollX) * scaleX,
        top: rect.top + (parent.clientTop - scrollY) * scaleY,
    };
}

function getTooltipGeometry(popupParent: HTMLElement, { ePopup, pointer, getSourceRect }: TooltipPopupPositionParams) {
    const doc = popupParent.ownerDocument;
    const win = doc.defaultView!;
    const { scaleX, scaleY, left, top } = getTooltipCoordinateSpace(ePopup);
    const viewport = {
        top: 0,
        left: 0,
        right: doc.documentElement.clientWidth || win.innerWidth,
        bottom: doc.documentElement.clientHeight || win.innerHeight,
    };
    let bounds = viewport;
    if (popupParent !== doc.body && popupParent !== doc.documentElement) {
        const rect = popupParent.getBoundingClientRect();
        bounds = {
            top: Math.max(0, rect.top + popupParent.clientTop * scaleY),
            left: Math.max(0, rect.left + popupParent.clientLeft * scaleX),
            right: Math.min(viewport.right, rect.left + (popupParent.clientLeft + popupParent.clientWidth) * scaleX),
            bottom: Math.min(viewport.bottom, rect.top + (popupParent.clientTop + popupParent.clientHeight) * scaleY),
        };
    }
    bounds = getClippedRect(popupParent, bounds);
    const sourceRect = pointer
        ? { top: pointer.clientY, bottom: pointer.clientY, left: pointer.clientX, right: pointer.clientX }
        : getSourceRect();
    if (!pointer) {
        sourceRect.left = Math.max(sourceRect.left, viewport.left);
        sourceRect.right = Math.min(sourceRect.right, viewport.right);
        sourceRect.top = Math.max(sourceRect.top, viewport.top);
        sourceRect.bottom = Math.min(sourceRect.bottom, viewport.bottom);
    }
    const reference = toRelativeRect(sourceRect, bounds);
    // The placement solver uses local CSS pixels, including the popup size, gap and arrow padding.
    reference.left /= scaleX;
    reference.right /= scaleX;
    reference.top /= scaleY;
    reference.bottom /= scaleY;
    return {
        reference,
        boundsSize: {
            width: Math.max(0, bounds.right - bounds.left) / scaleX,
            height: Math.max(0, bounds.bottom - bounds.top) / scaleY,
        },
        offset: { x: (bounds.left - left) / scaleX, y: (bounds.top - top) / scaleY },
    };
}

function measureTooltip(ePopup: HTMLElement, position: TooltipPosition, maxWidth: number) {
    const isDefaultTooltip = ePopup.classList.contains('ag-tooltip');
    if (isDefaultTooltip) {
        setTooltipStyle(ePopup, '--ag-internal-tooltip-max-width', `${maxWidth}px`);
    }
    let positionClass: string | undefined;
    for (const cls of ePopup.classList) {
        if (cls.startsWith('ag-tooltip-position-')) {
            positionClass = cls;
            break;
        }
    }
    if (!positionClass) {
        positionClass = `ag-tooltip-position-${position}`;
        ePopup.classList.add(positionClass);
    } else if (!isDefaultTooltip && positionClass !== `ag-tooltip-position-${position}`) {
        ePopup.classList.replace(positionClass, `ag-tooltip-position-${position}`);
        positionClass = `ag-tooltip-position-${position}`;
    }
    let arrowPadding = 0;
    if (isDefaultTooltip) {
        const win = ePopup.ownerDocument.defaultView!;
        const style = win.getComputedStyle(ePopup);
        const arrowStyle = win.getComputedStyle(ePopup, '::after');
        // Custom components clamp their own arrows; only the built-in arrow has a known shape.
        arrowPadding =
            (Number.parseFloat(style.borderRadius) || 0) + (Number.parseFloat(arrowStyle.width) / Math.SQRT2 || 0);
    }
    return {
        width: ePopup.offsetWidth,
        height: ePopup.offsetHeight,
        borderLeft: ePopup.clientLeft,
        borderTop: ePopup.clientTop,
        arrowPadding,
        positionClass,
    };
}

function setTooltipStyle(ePopup: HTMLElement, property: string, value: string): void {
    if (ePopup.style.getPropertyValue(property) !== value) {
        ePopup.style.setProperty(property, value);
    }
}

function getClippedRect(element: HTMLElement, rect: Rect): Rect {
    let { top, right, bottom, left } = rect;
    const doc = element.ownerDocument;
    const win = doc.defaultView!;
    let parent = element.parentElement ?? ((element.getRootNode() as ShadowRoot).host as HTMLElement | null);
    // Viewport bounds are applied separately; the scroll root's rect moves with the page.
    while (parent && parent !== doc.scrollingElement) {
        const { overflowX, overflowY } = win.getComputedStyle(parent);
        if (overflowX !== 'visible' || overflowY !== 'visible') {
            const rect = parent.getBoundingClientRect();
            const scaleX = parent.offsetWidth ? rect.width / parent.offsetWidth : 1;
            const scaleY = parent.offsetHeight ? rect.height / parent.offsetHeight : 1;
            if (overflowX && overflowX !== 'visible') {
                left = Math.max(left, rect.left + parent.clientLeft * scaleX);
                right = Math.min(right, rect.left + (parent.clientLeft + parent.clientWidth) * scaleX);
            }
            if (overflowY && overflowY !== 'visible') {
                top = Math.max(top, rect.top + parent.clientTop * scaleY);
                bottom = Math.min(bottom, rect.top + (parent.clientTop + parent.clientHeight) * scaleY);
            }
        }
        parent = parent.parentElement ?? ((parent.getRootNode() as ShadowRoot).host as HTMLElement | null);
    }
    return { top, right, bottom, left };
}

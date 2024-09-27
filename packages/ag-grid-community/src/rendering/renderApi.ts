import { _unwrapUserComp } from '../components/framework/unwrapUserComp';
import type { BeanCollection } from '../context/context';
import { _getRowHeightAsNumber } from '../gridOptionsUtils';
import { _warnOnce } from '../utils/function';
import { _exists } from '../utils/generic';
import type { ICellRenderer } from './cellRenderers/iCellRenderer';
import type { FlashCellsParams, GetCellRendererInstancesParams, RefreshCellsParams } from './rowRenderer';

export function setGridAriaProperty(beans: BeanCollection, property: string, value: string | null): void {
    if (!property) {
        return;
    }
    const eGrid = beans.ctrlsService.getGridBodyCtrl().getGui();
    const ariaProperty = `aria-${property}`;

    if (value === null) {
        eGrid.removeAttribute(ariaProperty);
    } else {
        eGrid.setAttribute(ariaProperty, value);
    }
}

export function refreshCells<TData = any>(beans: BeanCollection, params: RefreshCellsParams<TData> = {}): void {
    beans.frameworkOverrides.wrapIncoming(() => beans.rowRenderer.refreshCells(params));
}

export function flashCells<TData = any>(beans: BeanCollection, params: FlashCellsParams<TData> = {}): void {
    const warning = (prop: 'fade' | 'flash') =>
        _warnOnce(
            `Since v31.1 api.flashCells parameter '${prop}Delay' is deprecated. Please use '${prop}Duration' instead.`
        );
    if (_exists(params.fadeDelay)) {
        warning('fade');
    }
    if (_exists(params.flashDelay)) {
        warning('flash');
    }

    beans.frameworkOverrides.wrapIncoming(() => beans.rowRenderer.flashCells(params));
}

export function refreshHeader(beans: BeanCollection) {
    beans.frameworkOverrides.wrapIncoming(() =>
        beans.ctrlsService.getHeaderRowContainerCtrls().forEach((c) => c.refresh())
    );
}

export function isAnimationFrameQueueEmpty(beans: BeanCollection): boolean {
    return beans.animationFrameService.isQueueEmpty();
}

export function flushAllAnimationFrames(beans: BeanCollection): void {
    beans.animationFrameService.flushAllFrames();
}

export function getSizesForCurrentTheme(beans: BeanCollection) {
    return {
        rowHeight: _getRowHeightAsNumber(beans.gos),
        headerHeight: beans.columnModel.getHeaderHeight(),
    };
}

export function getCellRendererInstances<TData = any>(
    beans: BeanCollection,
    params: GetCellRendererInstancesParams<TData> = {}
): ICellRenderer[] {
    const res = beans.rowRenderer.getCellRendererInstances(params);
    const unwrapped = res.map(_unwrapUserComp);
    return unwrapped;
}

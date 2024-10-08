import { _unwrapUserComp } from '../components/framework/unwrapUserComp';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _getRowHeightAsNumber } from '../gridOptionsUtils';
import type { FlashCellsParams, RefreshCellsParams } from '../interfaces/iCellsParams';
import type { GetCellRendererInstancesParams, ICellRenderer } from './cellRenderers/iCellRenderer';
import { isRowInMap, mapRowNodes } from './rowRenderer';

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
    beans.frameworkOverrides.wrapIncoming(() => {
        beans.rowRenderer.forMatchingCellCtrls(params.rowNodes, params.columns as AgColumn[], (cellCtrl) =>
            cellCtrl.flashCell(params)
        );
    });
}

export function refreshHeader(beans: BeanCollection) {
    beans.frameworkOverrides.wrapIncoming(() =>
        beans.ctrlsService.getHeaderRowContainerCtrls().forEach((c) => c.refresh())
    );
}

export function isAnimationFrameQueueEmpty(beans: BeanCollection): boolean {
    return beans.animationFrameService?.isQueueEmpty() ?? true;
}

export function flushAllAnimationFrames(beans: BeanCollection): void {
    beans.animationFrameService?.flushAllFrames();
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
    const cellRenderers: ICellRenderer[] = [];
    beans.rowRenderer.forMatchingCellCtrls(params.rowNodes, params.columns as AgColumn[], (cellCtrl) => {
        const renderer = cellCtrl.getCellRenderer();
        if (renderer != null) {
            cellRenderers.push(renderer);
        }
    });
    if (params.columns?.length) {
        return cellRenderers.map(_unwrapUserComp);
    }

    const fullWidthRenderers: ICellRenderer[] = [];
    const rowIdMap = mapRowNodes(params.rowNodes);

    beans.rowRenderer.forEveryRowCtrl((rowCtrl) => {
        if (rowIdMap && !isRowInMap(rowCtrl.getRowNode(), rowIdMap)) {
            return;
        }

        if (!rowCtrl.isFullWidth()) {
            return;
        }

        const renderers = rowCtrl.getFullWidthCellRenderers();
        for (let i = 0; i < renderers.length; i++) {
            const renderer = renderers[i];
            if (renderer != null) {
                fullWidthRenderers.push(renderer);
            }
        }
    });

    return [...fullWidthRenderers, ...cellRenderers].map(_unwrapUserComp);
}

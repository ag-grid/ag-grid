import { _unwrapUserComp } from '../components/framework/unwrapUserComp';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _getRowHeightAsNumber } from '../gridOptionsUtils';
import { getHeaderHeight } from '../headerRendering/headerUtils';
import type { RefreshCellsParams } from '../interfaces/iCellsParams';
import type { GetCellRendererInstancesParams, ICellRenderer } from './cellRenderers/iCellRenderer';
import { isRowInMap, mapRowNodes } from './rowRenderer';

export function setGridAriaProperty(beans: BeanCollection, property: string, value: string | null): void {
    if (!property) {
        return;
    }
    const eGrid = beans.ctrlsSvc.getGridBodyCtrl().eGridViewport;
    const ariaProperty = `aria-${property}`;

    if (value === null) {
        eGrid.removeAttribute(ariaProperty);
    } else {
        eGrid.setAttribute(ariaProperty, value);
    }
}

export function refreshCells<TData = any>(beans: BeanCollection, params: RefreshCellsParams<TData> = {}): void {
    beans.frameworkOverrides.wrapIncoming(() => {
        const { colModel, rowRenderer } = beans;
        // data mutated in place can change what a span callback returns
        if (colModel.colSpanActive || colModel.rowSpanCols !== null) {
            const rowCtrls = rowRenderer.getRowCtrls(params.rowNodes);
            for (let i = 0, len = rowCtrls.length; i < len; ++i) {
                rowCtrls[i].refreshSpans();
            }
        }
        rowRenderer.refreshCells(params);
    });
}

export function refreshHeader(beans: BeanCollection) {
    beans.frameworkOverrides.wrapIncoming(() => {
        beans.ctrlsSvc.getHeaderRowContainerCtrl()?.refresh();
    });
}

export function isAnimationFrameQueueEmpty(beans: BeanCollection): boolean {
    return beans.animationFrameSvc?.isQueueEmpty() ?? true;
}

export function flushAllAnimationFrames(beans: BeanCollection): void {
    beans.animationFrameSvc?.flushAllFrames();
}

export function getSizesForCurrentTheme(beans: BeanCollection) {
    return {
        rowHeight: _getRowHeightAsNumber(beans),
        headerHeight: getHeaderHeight(beans),
    };
}

export function getCellRendererInstances<TData = any>(
    beans: BeanCollection,
    params: GetCellRendererInstancesParams<TData> = {}
): ICellRenderer[] {
    const cellRenderers: ICellRenderer[] = [];
    for (const cellCtrl of beans.rowRenderer.getCellCtrls(params.rowNodes, params.columns as AgColumn[])) {
        const cellRenderer = cellCtrl.getCellRenderer();
        if (cellRenderer != null) {
            cellRenderers.push(_unwrapUserComp(cellRenderer));
        }
    }
    if (params.columns?.length) {
        return cellRenderers;
    }

    const fullWidthRenderers: ICellRenderer[] = [];
    const rowIdMap = mapRowNodes(params.rowNodes);

    for (const rowCtrl of beans.rowRenderer.getAllRowCtrls()) {
        if (rowIdMap && !isRowInMap(rowCtrl.rowNode, rowIdMap)) {
            continue;
        }

        if (!rowCtrl.isFullWidth()) {
            continue;
        }

        for (const renderer of rowCtrl.getModeCellRenderers()) {
            if (renderer != null) {
                fullWidthRenderers.push(_unwrapUserComp(renderer));
            }
        }
    }

    return [...fullWidthRenderers, ...cellRenderers];
}

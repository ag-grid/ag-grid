import type { ColumnModel } from '../columns/columnModel';
import type { BeanCollection } from '../context/context';
import type { HeaderRowCtrl } from './row/headerRowCtrl';

// + gridPanel -> for resizing the body and setting top margin
export function getHeaderRowCount(colModel: ColumnModel): number {
    return colModel.cols ? colModel.cols.treeDepth + 1 : -1;
}

export function getFocusHeaderRowCount(beans: BeanCollection): number {
    return beans.ctrlsSvc.getHeaderRowContainerCtrl()?.getRowCount() ?? 0;
}

export function getGroupRowsHeight(beans: BeanCollection): number[] {
    const heights: number[] = [];
    const headerRowContainerCtrls = beans.ctrlsSvc.getHeaderRowContainerCtrls();

    for (const headerRowContainerCtrl of headerRowContainerCtrls) {
        if (!headerRowContainerCtrl) {
            continue;
        }

        const groupRowCount = headerRowContainerCtrl.getGroupRowCount() || 0;

        for (let i = 0; i < groupRowCount; i++) {
            const headerRowCtrl = headerRowContainerCtrl.getGroupRowCtrlAtIndex(i);

            const currentHeightAtPos = heights[i];
            if (headerRowCtrl) {
                const newHeight = getColumnGroupHeaderRowHeight(beans, headerRowCtrl);
                if (currentHeightAtPos == null || newHeight > currentHeightAtPos) {
                    heights[i] = newHeight;
                }
            }
        }
    }

    return heights;
}

function getColumnGroupHeaderRowHeight(beans: BeanCollection, headerRowCtrl: HeaderRowCtrl): number {
    const defaultHeight = beans.colModel.isPivotMode() ? getPivotGroupHeaderHeight(beans) : getGroupHeaderHeight(beans);
    let maxDisplayedHeight = defaultHeight;
    const headerRowCellCtrls = headerRowCtrl.getHeaderCellCtrls();
    for (const headerCellCtrl of headerRowCellCtrls) {
        const { column } = headerCellCtrl;
        const height = column.getAutoHeaderHeight();
        if (height != null && height > maxDisplayedHeight && column.isAutoHeaderHeight()) {
            maxDisplayedHeight = height;
        }
    }
    return maxDisplayedHeight;
}

export function getColumnHeaderRowHeight(beans: BeanCollection): number {
    const defaultHeight = beans.colModel.isPivotMode() ? getPivotHeaderHeight(beans) : getHeaderHeight(beans);
    let maxDisplayedHeight = defaultHeight;
    beans.colModel.forAllCols((col) => {
        const height = col.getAutoHeaderHeight();
        if (height != null && height > maxDisplayedHeight && col.isAutoHeaderHeight()) {
            maxDisplayedHeight = height;
        }
    });
    return maxDisplayedHeight;
}

export function getHeaderHeight(beans: BeanCollection): number {
    return beans.gos.get('headerHeight') ?? beans.environment.getDefaultHeaderHeight();
}

export function getFloatingFiltersHeight(beans: BeanCollection): number {
    return beans.gos.get('floatingFiltersHeight') ?? getHeaderHeight(beans);
}

function getGroupHeaderHeight(beans: BeanCollection): number {
    return beans.gos.get('groupHeaderHeight') ?? getHeaderHeight(beans);
}

function getPivotHeaderHeight(beans: BeanCollection): number {
    return beans.gos.get('pivotHeaderHeight') ?? getHeaderHeight(beans);
}

function getPivotGroupHeaderHeight(beans: BeanCollection): number {
    return beans.gos.get('pivotGroupHeaderHeight') ?? getGroupHeaderHeight(beans);
}

import type { BeanCollection } from 'ag-grid-community';

import type { ColumnToolPanelUpdateStrategy } from './columnToolPanelUpdates';
import type { IColumnToolPanelUpdateStrategy } from './columnToolPanelUpdatesTypes';

export function getColumnToolPanelEditStrategy(beans: BeanCollection): IColumnToolPanelUpdateStrategy | undefined {
    return beans.colToolPanelUpdateStrategy as ColumnToolPanelUpdateStrategy | undefined;
}

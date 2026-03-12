import type { BeanCollection } from 'ag-grid-community';

import type { IColumnToolPanelUpdateStrategy } from './columnToolPanelUpdatesTypes';

export function getColumnToolPanelUpdates(beans: BeanCollection): IColumnToolPanelUpdateStrategy {
    return beans.colToolPanelUpdates as IColumnToolPanelUpdateStrategy;
}

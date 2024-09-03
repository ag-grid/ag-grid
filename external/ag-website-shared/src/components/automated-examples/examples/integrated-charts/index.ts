/**
 * Automated Integrated Charts demo
 */
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';

import { type AutomatedExample } from '../../types.d';
import {
    type CreateAutomatedIntegratedChartsParams,
    createAutomatedIntegratedChartsWithCreateGrid,
} from './createAutomatedIntegratedChartsWithCreateGrid';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClipboardModule,
    GridChartsModule,
    MenuModule,
    RowGroupingModule,
    SideBarModule,
]);

/**
 * Create automated integrated charts example using modules
 */
export function createAutomatedIntegratedCharts(params: CreateAutomatedIntegratedChartsParams): AutomatedExample {
    return createAutomatedIntegratedChartsWithCreateGrid({
        createGrid,
        ...params,
    });
}

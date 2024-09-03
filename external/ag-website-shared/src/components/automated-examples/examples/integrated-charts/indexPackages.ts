/**
 * Automated Integrated Charts demo
 */
import { type AutomatedExample } from '../../types.d';
import {
    type CreateAutomatedIntegratedChartsParams,
    createAutomatedIntegratedChartsWithCreateGrid,
} from './createAutomatedIntegratedChartsWithCreateGrid';

/**
 * Create automated integrated charts example using packages
 *
 * NOTE: Assumes `ag-grid-charts-enterprise` is loaded on the page before this component is loaded
 */
export function createAutomatedIntegratedCharts(params: CreateAutomatedIntegratedChartsParams): AutomatedExample {
    return createAutomatedIntegratedChartsWithCreateGrid({
        createGrid: globalThis.agGrid.createGrid,
        ...params,
    });
}

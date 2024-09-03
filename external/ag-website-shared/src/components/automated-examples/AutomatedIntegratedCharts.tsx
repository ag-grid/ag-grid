import { createAutomatedIntegratedCharts } from '@ag-website-shared/components/automated-examples/examples/integrated-charts';

import {
    type AutomatedIntegratedChartsProps,
    AutomatedIntegratedChartsWithCreate,
} from './AutomatedIntegratedChartsWithCreate';

/**
 * Load automated integrated charts example using modules
 */
export function AutomatedIntegratedCharts(props: AutomatedIntegratedChartsProps) {
    return (
        <AutomatedIntegratedChartsWithCreate
            createAutomatedIntegratedCharts={createAutomatedIntegratedCharts}
            {...props}
        />
    );
}

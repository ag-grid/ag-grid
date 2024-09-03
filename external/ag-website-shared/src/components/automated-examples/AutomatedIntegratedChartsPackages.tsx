import { createAutomatedIntegratedCharts } from '@ag-website-shared/components/automated-examples/examples/integrated-charts/indexPackages';

import {
    type AutomatedIntegratedChartsProps,
    AutomatedIntegratedChartsWithCreate,
} from './AutomatedIntegratedChartsWithCreate';

/**
 * Load automated integrated charts example using packages
 */
export function AutomatedIntegratedChartsWithPackages(props: AutomatedIntegratedChartsProps) {
    return (
        <AutomatedIntegratedChartsWithCreate
            createAutomatedIntegratedCharts={createAutomatedIntegratedCharts}
            {...props}
        />
    );
}

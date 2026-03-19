import type { _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../../agGridEnterpriseModule';
import { VERSION } from '../../version';
import { ColumnStateUpdateStrategy } from './columnStateUpdateStrategy';

/**
 * @internal
 * Shared module providing column tool panel update access for tool panel and row grouping UI.
 */
export const SharedColumnStateUpdateStrategyModule: _ModuleWithoutApi = {
    moduleName: 'SharedColumnStateUpdateStrategy',
    version: VERSION,
    beans: [ColumnStateUpdateStrategy],
    dependsOn: [EnterpriseCoreModule],
};

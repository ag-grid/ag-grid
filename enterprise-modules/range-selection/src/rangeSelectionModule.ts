import { Module, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { FillHandle } from './rangeSelection/fillHandle';
import { RangeHandle } from './rangeSelection/rangeHandle';
import { RangeService } from './rangeSelection/rangeService';
import { SelectionHandleFactory } from './rangeSelection/selectionHandleFactory';
import { VERSION } from './version';

export const RangeSelectionModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.RangeSelectionModule,
    beans: [RangeService, SelectionHandleFactory],
    agStackComponents: [
        { componentName: 'AgFillHandle', componentClass: FillHandle },
        { componentName: 'AgRangeHandle', componentClass: RangeHandle },
    ],
    dependantModules: [EnterpriseCoreModule],
};

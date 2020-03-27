import { Module, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { DateTimeCellEditor } from './dateTimeCellEditor/dateTimeCellEditor';

export const DateTimeCellEditorModule: Module = {
    moduleName: ModuleNames.DateTimeCellEditorModule,
    beans: [],
    userComponents: [
        { componentName: 'agDateTime', componentClass: DateTimeCellEditor },
        { componentName: 'agDateTimeCellEditor', componentClass: DateTimeCellEditor },
    ],
    dependantModules: [EnterpriseCoreModule],
};

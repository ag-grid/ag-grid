import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { DateTimeCellEditor } from './dateTimeCellEditor/dateTimeCellEditor';
export var DateTimeCellEditorModule = {
    moduleName: ModuleNames.DateTimeCellEditorModule,
    beans: [],
    userComponents: [
        { componentName: 'agDateTimeCellEditor', componentClass: DateTimeCellEditor },
    ],
    dependantModules: [EnterpriseCoreModule],
};

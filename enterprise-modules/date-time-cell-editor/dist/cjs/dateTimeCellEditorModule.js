"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeCellEditorModule = void 0;
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var dateTimeCellEditor_1 = require("./dateTimeCellEditor/dateTimeCellEditor");
exports.DateTimeCellEditorModule = {
    moduleName: core_1.ModuleNames.DateTimeCellEditorModule,
    beans: [],
    userComponents: [
        { componentName: 'agDateTimeCellEditor', componentClass: dateTimeCellEditor_1.DateTimeCellEditor },
    ],
    dependantModules: [core_2.EnterpriseCoreModule],
};
//# sourceMappingURL=dateTimeCellEditorModule.js.map
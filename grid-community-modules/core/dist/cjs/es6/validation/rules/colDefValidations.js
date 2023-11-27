"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COL_DEF_VALIDATORS = void 0;
const moduleNames_1 = require("../../modules/moduleNames");
const colDefUtil_1 = require("../../components/colDefUtil");
const COLUMN_DEFINITION_DEPRECATIONS = {};
const CSRM_REQUIRES_ROW_GROUP_MODULE = (_options, gridOptions) => {
    var _a;
    if ((_a = gridOptions.rowModelType) !== null && _a !== void 0 ? _a : 'clientSide' === 'clientSide') {
        return { module: moduleNames_1.ModuleNames.RowGroupingModule };
    }
    return null;
};
const COLUMN_DEFINITION_VALIDATIONS = {
    // supported on all row models, but need module for client side.
    enableRowGroup: CSRM_REQUIRES_ROW_GROUP_MODULE,
    rowGroup: CSRM_REQUIRES_ROW_GROUP_MODULE,
    rowGroupIndex: CSRM_REQUIRES_ROW_GROUP_MODULE,
    enablePivot: CSRM_REQUIRES_ROW_GROUP_MODULE,
    enableValue: CSRM_REQUIRES_ROW_GROUP_MODULE,
    pivot: CSRM_REQUIRES_ROW_GROUP_MODULE,
    pivotIndex: CSRM_REQUIRES_ROW_GROUP_MODULE,
    aggFunc: CSRM_REQUIRES_ROW_GROUP_MODULE,
    cellEditor: (options) => {
        if (options.cellEditor === 'agRichSelect' || options.cellEditor === 'agRichSelectCellEditor') {
            return { module: moduleNames_1.ModuleNames.RichSelectModule };
        }
        return null;
    },
    menuTabs: (options) => {
        var _a;
        const enterpriseMenuTabs = ['columnsMenuTab', 'generalMenuTab'];
        if ((_a = options.menuTabs) === null || _a === void 0 ? void 0 : _a.some(tab => enterpriseMenuTabs.includes(tab))) {
            return {
                module: moduleNames_1.ModuleNames.MenuModule,
            };
        }
        return null;
    },
    columnsMenuParams: {
        module: [moduleNames_1.ModuleNames.MenuModule, moduleNames_1.ModuleNames.ColumnsToolPanelModule],
    },
    headerCheckboxSelection: {
        supportedRowModels: ['clientSide', 'serverSide'],
        dependencies: (_options, { rowSelection }) => (rowSelection === 'multiple' ? null : 'headerCheckboxSelection is only supported with rowSelection=multiple')
    },
    headerCheckboxSelectionFilteredOnly: {
        supportedRowModels: ['clientSide'],
        dependencies: (_options, { rowSelection }) => (rowSelection === 'multiple' ? null : 'headerCheckboxSelectionFilteredOnly is only supported with rowSelection=multiple'),
    },
    headerCheckboxSelectionCurrentPageOnly: {
        supportedRowModels: ['clientSide'],
        dependencies: (_options, { rowSelection }) => (rowSelection === 'multiple' ? null : 'headerCheckboxSelectionCurrentPageOnly is only supported with rowSelection=multiple'),
    },
    children: () => exports.COL_DEF_VALIDATORS,
};
exports.COL_DEF_VALIDATORS = {
    objectName: 'colDef',
    allProperties: colDefUtil_1.ColDefUtil.ALL_PROPERTIES,
    docsUrl: 'column-properties/',
    deprecations: COLUMN_DEFINITION_DEPRECATIONS,
    validations: COLUMN_DEFINITION_VALIDATIONS,
};
